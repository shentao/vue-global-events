// common filters for global events

/**
 * Creates a filter than can be passed to `<GlobalEvents />` to exclude events from elements with the given tag names.
 *
 * @param tagNames - array of tag names to exclude
 */
export function excludeElements(tagNames: Array<Uppercase<_HTMLElementNames>>) {
  return (event: Event) => {
    const target = event.target as HTMLElement
    return !(tagNames as string[]).includes(target.tagName)
  }
}

/**
 * Creates a filter than can be passed to `<GlobalEvents />` to include events from elements with the given tag names.
 *
 * @see excludeElements
 *
 * @param tagNames - array of tag names to include
 */
export function includeElements(tagNames: Array<Uppercase<_HTMLElementNames>>) {
  return (event: Event) => {
    const target = event.target as HTMLElement
    return (tagNames as string[]).includes(target.tagName)
  }
}

// @internal
export type _HTMLElementNames = keyof HTMLElementTagNameMap
