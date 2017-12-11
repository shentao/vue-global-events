const modifiersRE = /^[~!&]*/
const nonEventNameCharsRE = /\W+/
const names = {
  '!': 'capture',
  '~': 'once',
  '&': 'passive'
}

function extractEventOptions (eventDescriptor) {
  const [modifiers] = eventDescriptor.match(modifiersRE)
  return modifiers.split('').reduce((options, modifier) => {
    options[names[modifier]] = true
    return options
  }, {})
}

export default {
  render: h => h(),

  mounted () {
    this._listeners = Object.create(null)
    Object.keys(this.$listeners).forEach(event => {
      const handler = this.$listeners[event]
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
