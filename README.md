# vue-global-events

> Listen to events on the document anywhere

## Installation
```bash
npm install vue-global-events
```

## [Demo](https://jsfiddle.net/shentao/jj7ku7mb/)

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
