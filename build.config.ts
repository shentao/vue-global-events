import { defineBuildConfig } from 'unbuild'
import type { PackageJson } from 'pkg-types'

export default defineBuildConfig({
  entries: ['./src/index', './src/filters.ts'],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },

  hooks: {
    'rollup:options'(ctx, options) {
      // in reality the output is always an array
      options.output = options.output
        ? Array.isArray(options.output)
          ? options.output
          : [options.output]
        : []

      options.output.push({
        name: 'VueGlobalEvents',
        // file: 'index.iife.js',
        dir: './dist',
        format: 'iife',
        globals: {
          'vue-demi': 'VueDemi',
          vue: 'Vue',
        },
        exports: 'auto',
        freeze: false,
        externalLiveBindings: false,
      })

      // add the banner
      const banner = getBanner(ctx.pkg)
      for (const output of options.output) {
        output.banner = banner
      }
    },
  },
})

function getAuthors(pkg: PackageJson) {
  const { contributors, author } = pkg

  const authors = new Set()
  if (contributors && contributors)
    contributors.forEach((contributor) => {
      authors.add(
        typeof contributor === 'string' ? contributor : contributor.name
      )
    })
  if (author) authors.add(typeof author === 'string' ? author : author.name)

  return Array.from(authors).join(', ')
}

function getBanner(pkg: PackageJson) {
  return `/*!
 * ${pkg.name} v${pkg.version}
 * (c) 2019-${new Date().getFullYear()} ${getAuthors(pkg)}
 * Released under the MIT License.
 */`
}
