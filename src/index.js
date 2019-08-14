import { isIE } from './utils'

const modifiersRE = /^[~!&]*/
const nonEventNameCharsRE = /\W+/
const names = {
  '!': 'capture',
  '~': 'once',
  '&': 'passive'
}

function extractEventOptions (eventDescriptor) {
  const [modifiers] = eventDescriptor.match(modifiersRE)

  // IE only supports capture option and it has to be a boolean
  // https://github.com/shentao/vue-global-events/issues/14
  if (isIE()) {
    return modifiers.indexOf('!') > -1
  }

  return modifiers.split('').reduce((options, modifier) => {
    options[names[modifier]] = true
    return options
  }, {})
}

export default {
  name: 'GlobalEvents',
  props: {
    target: {
      type: String,
      default: 'document'
    },
    filter: {
      type: Function,
      default: e => true
    }
  },

  render: h => h(),

  mounted () {
    this._listeners = Object.create(null)
    Object.entries(this.$listeners).forEach(([event, listener]) => {
      const handler = e => {
        this.filter(e, listener, event) && listener(e)
      }
      window[this.target].addEventListener(
        event.replace(nonEventNameCharsRE, ''),
        handler,
        extractEventOptions(event)
      )
      this._listeners[event] = handler
    })
  },

  beforeDestroy () {
    for (const event in this._listeners) {
      window[this.target].removeEventListener(
        event.replace(nonEventNameCharsRE, ''),
        this._listeners[event],
        extractEventOptions(event)
      )
    }
  }
}
