# vue-global-events

> Listen to events on the document anywhere

## Installation
```bash
npm install vue-global-events
```

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
