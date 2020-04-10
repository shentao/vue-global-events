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

function getTarget (context) {
  const target = context.target
  if (typeof target === 'string') {
    if (/^(window|document)$/.test(target)) {
      return window[target]
    }
    const $el = context.$parent.$el
    if (target === '$parent') {
      return $el
    }
    return $el.querySelector(target)
  }
  return target
}

export default {
  name: 'GlobalEvents',
  props: {
    target: {
      type: [String, HTMLElement],
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
    const target = getTarget(this)
    Object.keys(this.$listeners).forEach(event => {
      const listener = this.$listeners[event]
      const handler = e => {
        this.filter(e, listener, event) && listener(e)
      }
      target.addEventListener(
        event.replace(nonEventNameCharsRE, ''),
        handler,
        extractEventOptions(event)
      )
      this._listeners[event] = handler
    })
  },

  beforeDestroy () {
    const target = getTarget(this)
    for (const event in this._listeners) {
      target.removeEventListener(
        event.replace(nonEventNameCharsRE, ''),
        this._listeners[event],
        extractEventOptions(event)
      )
    }
  }
}
