// @ts-check
import minimist from 'minimist'
import fs from 'node:fs/promises'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import chalk from 'chalk'
import semver from 'semver'
import prompts from '@posva/prompts'
import { execa } from 'execa'
import pSeries from 'p-series'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const args = minimist(process.argv.slice(2))
let {
  skipBuild,
  tag: optionTag,
  dry: isDryRun,
  skipCleanCheck: skipCleanGitCheck,
} = args

// const preId =
//   args.preid ||
//   (semver.prerelease(currentVersion) && semver.prerelease(currentVersion)[0])
const EXPECTED_BRANCH = 'main'
// for multi packages
const MAIN_PACKAGE = 'vue-global-events'

// function incrementVersion(increment) {
//   return semver.inc(currentVersion, increment, preId)
// }
// const bin = (name) => resolve(__dirname, '../node_modules/.bin/' + name)
/**
 * @param bin {string}
 * @param args {readonly string[]}
 * @param opts {import('execa').CommonOptions<string>}
 * @returns
 */
const run = (bin, args, opts = {}) =>
  execa(bin, args, { stdio: 'inherit', ...opts })
const dryRun = (bin, args, opts = {}) =>
  console.log(chalk.blue(`[dryrun] ${bin} ${args.join(' ')}`), opts)
const runIfNotDry = isDryRun ? dryRun : run
const step = (msg) => console.log(chalk.cyan(msg))

async function main() {
  if (!skipCleanGitCheck) {
    const isDirtyGit = !!(
      await run('git', ['status', '--porcelain'], { stdio: 'pipe' })
    ).stdout

    if (isDirtyGit) {
      console.log(chalk.red(`Git repo isn't clean.`))
      return
    }

    const currentBranch = (
      await run('git', ['branch', '--show-current'], { stdio: 'pipe' })
    ).stdout

    if (currentBranch !== EXPECTED_BRANCH) {
      console.log(
        chalk.red(
          `You should be on branch "${EXPECTED_BRANCH}" but are on "${currentBranch}"`
        )
      )
      return
    }
  } else {
    console.log(chalk.bold.white(`Skipping git checks...`))
  }

  if (!skipCleanGitCheck) {
    const isOutdatedRE = new RegExp(
      `\\W${EXPECTED_BRANCH}\\W.*(?:fast-forwardable|local out of date)`,
      'i'
    )

    const isOutdatedGit = isOutdatedRE.test(
      (await run('git', ['remote', 'show', 'origin'], { stdio: 'pipe' })).stdout
    )

    if (isOutdatedGit) {
      console.log(chalk.red(`Git branch is not in sync with remote`))
      return
    }
  }

  const changedPackages = await getChangedPackages()
  if (!changedPackages.length) {
    console.log(chalk.red(`No packages have changed since last release`))
    return
  }

  if (isDryRun) {
    console.log('\n' + chalk.bold.blue('This is a dry run') + '\n')
  }

  // NOTE: I'm unsure if this would mess up the changelog
  // const { pickedPackages } = await prompts({
  //   type: 'multiselect',
  //   name: 'pickedPackages',
  //   message: 'What packages do you want to release?',
  //   choices: changedPackages.map((pkg) => ({
  //     title: pkg.name,
  //     value: pkg.name,
  //   })),
  //   hint: '- Space to select. Return to submit',
  // })

  const packagesToRelease = changedPackages
  // const packagesToRelease = changedPackages.filter((pkg) =>
  //   pickedPackages.includes(pkg.name)
  // )

  step(
    `Ready to release ${packagesToRelease
      .map(({ name }) => chalk.bold.white(name))
      .join(', ')}`
  )

  const pkgWithVersions = await pSeries(
    packagesToRelease.map(({ name, path, pkg }) => async () => {
      if (!pkg.version) {
        throw new Error('No version found in package.json')
      }

      let { version } = pkg

      const prerelease = semver.prerelease(version)
      const preId = prerelease?.[0] != null

      /** @type {Array<'patch' | 'minor' | 'major' | 'prepatch' | 'preminor' | 'premajor' | 'prerelease'>} */
      const versionIncrements = [
        'patch',
        'minor',
        'major',
        // @ts-expect-error: too annoying to type in jsdoc
        ...(preId ? ['prepatch', 'preminor', 'premajor', 'prerelease'] : []),
      ]

      const { release } = await prompts({
        type: 'select',
        name: 'release',
        message: `Select release type for ${chalk.bold.white(name)}`,
        validate: (v) => (typeof v === 'string' ? true : 'This is mandatory'),
        choices: versionIncrements
          .map((i) => {
            const newVersion = semver.inc(version, i, preId)
            return {
              title: `${i}: ${name} (${newVersion})`,
              value: newVersion,
              // `${i}: ${name} (${semver.inc(version, i, preId)})`
            }
          })
          .concat([
            {
              title: 'Custom',
              value: 'custom',
            },
          ]),
      })

      if (release == null) {
        process.exit(0)
      }

      if (release === 'custom') {
        version = (
          await prompts({
            type: 'text',
            name: 'version',
            message: `Input custom version (${chalk.bold.white(name)})`,
            initial: version,
            validate: (v) => {
              return semver.valid(v) ? true : 'Invalid semver version'
            },
          })
        ).version
      } else {
        version = release
      }

      return { name, path, version, pkg }
    })
  )

  const { isReleaseConfirmed } = await prompts({
    type: 'confirm',
    name: 'isReleaseConfirmed',
    message: `Releasing \n${pkgWithVersions
      .map(
        ({ name, version }) =>
          `  · ${chalk.white(name)}: ${chalk.yellow.bold('v' + version)}`
      )
      .join('\n')}\nConfirm?`,
  })

  if (!isReleaseConfirmed) {
    return
  }

  step('\nUpdating versions in package.json files...')
  await updateVersions(pkgWithVersions)

  step('\nGenerating changelogs...')
  for (const pkg of pkgWithVersions) {
    step(` -> ${pkg.name} (${pkg.path})`)
    await runIfNotDry(`pnpm`, ['run', 'changelog'], { cwd: pkg.path })
    await runIfNotDry(`pnpm`, ['exec', 'prettier', '--write', 'CHANGELOG.md'], {
      cwd: pkg.path,
    })
  }

  const { isChangelogCorrect } = await prompts({
    type: 'confirm',
    name: 'isChangelogCorrect',
    message: 'Are the changelogs correct?',
  })

  if (!isChangelogCorrect) {
    return
  }

  step('\nBuilding all packages...')
  if (!skipBuild && !isDryRun) {
    await run('pnpm', ['run', 'build'])
  } else {
    console.log(`(skipped)`)
  }

  const { stdout } = await run('git', ['diff'], { stdio: 'pipe' })
  if (stdout) {
    step('\nCommitting changes...')
    await runIfNotDry('git', ['add', 'CHANGELOG.md', 'package.json'])
    await runIfNotDry('git', [
      'commit',
      '-m',
      `release: ${pkgWithVersions
        .map(({ name, version }) => `${name}@${version}`)
        .join(' ')}`,
    ])
  } else {
    console.log('No changes to commit.')
  }

  step('\nCreating tags...')
  let versionsToPush = []
  for (const pkg of pkgWithVersions) {
    const tagName =
      pkg.name === MAIN_PACKAGE
        ? `v${pkg.version}`
        : `${pkg.name}@${pkg.version}`
    versionsToPush.push(`refs/tags/${tagName}`)
    await runIfNotDry('git', ['tag', `${tagName}`])
  }

  step('\nPublishing packages...')
  for (const pkg of pkgWithVersions) {
    await publishPackage(pkg)
  }

  step('\nPushing to Github...')
  await runIfNotDry('git', ['push', 'origin', ...versionsToPush])
  await runIfNotDry('git', ['push'])
}

/**
 *
 * @param packageList {{ name: string; path: string; version: string, pkg: any }[]}
 */
async function updateVersions(packageList) {
  return Promise.all(
    packageList.map(({ pkg, version, path, name }) => {
      pkg.version = version
      updateDeps(pkg, 'dependencies', packageList)
      updateDeps(pkg, 'peerDependencies', packageList)
      const content = JSON.stringify(pkg, null, 2) + '\n'
      return isDryRun
        ? dryRun('write', [name], {
            dependencies: pkg.dependencies,
            peerDependencies: pkg.peerDependencies,
          })
        : fs.writeFile(join(path, 'package.json'), content)
    })
  )
}

function updateDeps(pkg, depType, updatedPackages) {
  const deps = pkg[depType]
  if (!deps) return
  step(`Updating ${chalk.bold(depType)} for ${chalk.bold.white(pkg.name)}...`)
  Object.keys(deps).forEach((dep) => {
    const updatedDep = updatedPackages.find((pkg) => pkg.name === dep)
    // avoid updated peer deps that are external like @vue/devtools-api
    if (dep && updatedDep) {
      console.log(
        chalk.yellow(
          `${pkg.name} -> ${depType} -> ${dep}@~${updatedDep.version}`
        )
      )
      deps[dep] = '>=' + updatedDep.version
    }
  })
}

async function publishPackage(pkg) {
  step(`Publishing ${pkg.name}...`)

  try {
    await runIfNotDry(
      'pnpm',
      [
        'publish',
        ...(optionTag ? ['--tag', optionTag] : []),
        '--access',
        'public',
        '--publish-branch',
        EXPECTED_BRANCH,
        ...(skipCleanGitCheck ? ['--no-git-checks'] : []),
      ],
      {
        cwd: pkg.path,
        stdio: 'pipe',
      }
    )
    console.log(
      chalk.green(`Successfully published ${pkg.name}@${pkg.version}`)
    )
  } catch (e) {
    if (e.stderr.match(/previously published/)) {
      console.log(chalk.red(`Skipping already published: ${pkg.name}`))
    } else {
      throw e
    }
  }
}

/**
 * Get the packages that have changed. Based on `lerna changed` but without lerna.
 *
 * @returns {Promise<{ name: string; path: string; pkg: import('pkg-types').PackageJson; version: string }[]>}
 */
async function getChangedPackages() {
  let lastTag

  try {
    const { stdout } = await run('git', ['describe', '--tags', '--abbrev=0'], {
      stdio: 'pipe',
    })
    lastTag = stdout
  } catch (error) {
    // maybe there are no tags
    console.error(`Couldn't get the last tag, using first commit...`)
    const { stdout } = await run(
      'git',
      ['rev-list', '--max-parents=0', 'HEAD'],
      { stdio: 'pipe' }
    )
    lastTag = stdout
  }
  // const folders = await globby(join(__dirname, '../packages/*'), {
  //   onlyFiles: false,
  // })
  const folders = ['./']

  const pkgs = await Promise.all(
    folders.map(async (folder) => {
      if (!(await fs.lstat(folder)).isDirectory()) return null

      const pkg = JSON.parse(
        await fs.readFile(join(folder, 'package.json'), 'utf8')
      )
      if (!pkg.private) {
        const { stdout: hasChanges } = await run(
          'git',
          [
            'diff',
            lastTag,
            '--',
            // apparently {src,package.json} doesn't work
            join(folder, 'client.d.ts'),
            join(folder, 'client.d.ts'),
            join(folder, 'src'),
            join(folder, 'package.json'),
          ],
          { stdio: 'pipe' }
        )

        if (hasChanges) {
          return {
            path: folder,
            name: pkg.name,
            version: pkg.version,
            pkg,
          }
        } else {
          return null
        }
      }
    })
  )

  // @ts-expect-error: Cannot make this filter work in jsdoc
  return pkgs.filter(
    /**
     *
     * @param {any} p
     * @returns p is { name: string; path: string; pkg: any; version: string }
     */
    (p) => p
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
