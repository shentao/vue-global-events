# vue-global-events

> Listen to events on the document anywhere

## Installation
```bash
npm install vue-global-events
```

## [Demo](https://jsfiddle.net/posva/qk6hr1k4/)

## Idea
Thanks to Vue’s event modifiers, handling events is extremely easy however, you’re limited to DOM element events.
We decided to change that, so now you can register global events (for example application shortcuts) just like you would listen to events on a component. No need to worry about unregistration either. You can toggle the events with a single `v-if`. Works with SSR too.

## Usage

```js
import GlobalEvents from 'vue-global-events'

// register globally
Vue.component(GlobalEvents)

// or locally
export default {
  components: { GlobalEvents },
  // rest of your component
}
```

After that you can register global events like this:

```html
<GlobalEvents
  v-if="listenersConnected"
  @keyup.ctrl.tab="nextTab"
  @keyup.ctrl.shift.tab="previousTab"
  @keyup.space="pause"
  @contextmenu="openMenu"
/>
```

## Advice / Caveats

- Always `.prevent` events with `.ctrl` and other modifiers as browsers may be using them as shortcuts.
- Do not use shortcuts that are used by the system or that the browser **does not allow you to `.preventDefault()`**. The list includes `Ctrl+Tab`/`Cmd+Tab`, `Ctrl+W`/`Ctrl+W`. You can find more information [in this StackOverflow answer](https://stackoverflow.com/a/40434403/3384501).
- Prefer using actual characters to keyCodes whenever possible: `@keydown.+` for detecting the plus sign. This is important because symbols and numbers on the digit row will provide different keyCodes depending on the layout used.
- You can add custom keyCodes to `Vue.config.keyCodes`. This is especially useful for numbers on the digit row: add `Vue.config.keyCodes.digit1 = 49` so you can write `@keydown.digit1` because writing `@keydown.1` will trigger when `keyCode === 1`.

## Development

Run tests in watch mode:

```bash
npm run dev
```

## Demo

Just use [poi](https://github.com/egoist/poi)

```bash
# if not yet installed
npm i -g poi

poi index.js
```

## Authors:

Damian Dulisz [@shentao](https://github.com/shentao)

Eduardo San Martin Morote [@posva](https://github.com/posva)

## License

[MIT](http://opensource.org/licenses/MIT)
