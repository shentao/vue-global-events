export default {
  render: h => h(),
  mounted () {
  	this._listeners = Object.create(null)
    Object.keys(this.$listeners).forEach(event => {
    	const handler = this.$listeners[event]
      document.addEventListener(event, handler)
      this._listeners[event] = handler
    })
  },
  beforeDestroy () {
    for (const event in this._listeners) {
      document.removeEventListener(event, this._listeners[event])
    }
  }
}
