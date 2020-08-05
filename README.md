# vue-global-events [![Build Status](https://img.shields.io/circleci/project/shentao/vue-global-events/master.svg)](https://circleci.com/gh/shentao/vue-global-events) [![npm package](https://img.shields.io/npm/v/vue-global-events.svg)](https://www.npmjs.com/package/vue-global-events) [![coverage](https://img.shields.io/codecov/c/github/shentao/vue-global-events.svg)](https://codecov.io/github/shentao/vue-global-events)

> Add shortcuts by listening to events on the document, anywhere

## Sponsors

### Bronze

<p align="center">
  <a href="https://www.vuemastery.com/" target="_blank">
    <img src="https://cdn.discordapp.com/attachments/258614093362102272/557267759130607630/Vue-Mastery-Big.png" alt="Vue Mastery logo" width="180px">
  </a>
  <a href="https://vuejobs.com/" target="_blank">
    <img src="https://cdn.discordapp.com/attachments/560524372897562636/636900598700179456/vuejobs-logo.png" alt="Vue Jobs logo" width="140px">
  </a>
</p>

## Installation

```bash
yarn add vue-global-events
npm install vue-global-events
```

## [Demo](https://jsfiddle.net/posva/o4hj375r/)

## Idea

Thanks to Vue’s event modifiers, handling events is extremely easy however, you’re limited to DOM element events.
We decided to change that, so now you can register global events (for example application shortcuts) just like you would listen to events on a component. No need to worry about removing them either. You can toggle the events with a single `v-if`. Works with SSR too.

## Usage

```js
import { GlobalEvents } from 'vue-global-events'

// register globally
app.component('GlobalEvents', GlobalEvents)

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

### Props

#### `target`

Target element where `addEventListener` is called on. It's a String that refers to a global variable like `document` or `window`. This allows you to add events to the `window` instead of `document`.

- type: `String`
- default: `'document'`

_Warning_: This prop is not reactive. It should be provided as a static value. If you need it to be reactive, add a `key` attribute with the same value:

```html
<GlobalEvents :target="target" :key="target" />
```

#### `filter`

Function to prevent any event from being executed based on anything related to the event like the element that triggered it, the name, or the handler.

- type: `Function`
- default: `() => true`

##### arguments

- `event`: Native Event Object
- `handler`: method passed to `GlobalEvents` component
- `eventName`: event name that was attached to the _target_ (See above)

`filter` should return `false` to prevent the execution of a handler. For example, you can avoid the calls if the event is triggered by an `<input>`:

```html
<GlobalEvents
  :filter="(event, handler, eventName) => event.target.tagName !== 'INPUT'"
  @keyup.prevent.space.exact="nextTab"
/>
```

In the example above `event` would be the native `keyup` [Event Object](https://developer.mozilla.org/en-US/docs/Web/API/Event), `handler` would be the method `nextTab` and `eventName` would be the string `keyup`.

## Advice / Caveats

- Always `.prevent` events with `.ctrl` and other modifiers as browsers may be using them as shortcuts.
- Do not use shortcuts that are used by the system or that the browser **does not allow you to `.preventDefault()`**. The list includes `Ctrl+Tab`/`Cmd+Tab`, `Ctrl+W`/`Cmd+W`. You can find more information [in this StackOverflow answer](https://stackoverflow.com/a/40434403/3384501).
- Prefer using actual characters to keyCodes whenever possible: `@keydown.+` for detecting the plus sign. This is important because symbols and numbers on the digit row will provide different keyCodes depending on the layout used.
- About using `keyup` with modifiers like `.ctrl` or `.shift`: the keyup event is triggered when a key is released and that's also when the `event.ctrlKey` is checked, which if you just released, will be false. This is because `ctrl`, `shift` and `alt` are checked differently. If you want to trigger on the `keyup` event of a modifier, you need to use its keycode ([check it here](http://keycode.info). For example, for the `ctrl` key, that would be: `@keyup.17`. You can also use the advice above this one to provide it a name like _ctrlkey_.

## Development

Run tests in watch mode:

```bash
yarn jest --watch
```

## Authors

Damian Dulisz [@shentao](https://github.com/shentao)

Eduardo San Martin Morote [@posva](https://github.com/posva)

## License

[MIT](http://opensource.org/licenses/MIT)

<div align="right">
<sub><em>
This project was created using the <a href="https://github.com/shentao/vue-global-events-boilerplate" rel="nofollow">Vue Library boilerplate</a> by <a href="https://github.com/posva" rel="nofollow">posva</a>
</em></sub>
</div>
