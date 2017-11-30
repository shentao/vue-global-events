# vue-global-events

## Work in progress. This is not yet published to NPM

## Installation
```bash
npm install vue-global-events --save
```

## Usage
```javascript
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
/>
```

## Development

Just use poi.

```bash
poi index.js
```

## Authors:
Damian Dulisz @shentao
Eduardo San Martin Morote @posva
