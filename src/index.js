const modifiersRE = /^[~!&]*/
const nonEventNameCharsRE = /\W+/
const names = {
  '!': 'capture',
  '~': 'once',
  '&': 'passive'
}

function isSupportPassive () {
  let passive = false
  const options = Object.defineProperty({}, 'passive', {
    get: () => (passive = true)
  })
  document.addEventListener('test', null, options)
  return passive
}

function extractEventOptions (eventDescriptor) {
  const [modifiers] = eventDescriptor.match(modifiersRE)
  const eventOptions = modifiers.split('').reduce((options, modifier) => {
    options[names[modifier]] = true
    return options
  }, {})
  return isSupportPassive() ? eventOptions : eventOptions.capture
}

export default {
  name: 'GlobalEvents',
  props: {
    filter: {
      type: Function,
      default: e => true
    }
  },

  render: h => h(),

  mounted () {
    this._listeners = Object.create(null)
    Object.keys(this.$listeners).forEach(event => {
      const listener = this.$listeners[event]
      const handler = e => {
        this.filter(e, listener, event) && listener(e)
      }
      document.addEventListener(
        event.replace(nonEventNameCharsRE, ''),
        handler,
        extractEventOptions(event)
      )
      this._listeners[event] = handler
    })
  },

  beforeDestroy () {
    for (const event in this._listeners) {
      document.removeEventListener(
        event.replace(nonEventNameCharsRE, ''),
        this._listeners[event]
      )
    }
  }
}
