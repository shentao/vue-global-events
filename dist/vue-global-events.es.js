/*!
 * vue-global-events v0.0.0
 * (c) 2017 Damian Dulisz
 * Released under the MIT License.
 */

var index = {
  render: function (h) { return h(); },
  mounted: function mounted () {
  	var this$1 = this;

  	this._listeners = Object.create(null);
    Object.keys(this.$listeners).forEach(function (event) {
    	var handler = this$1.$listeners[event];
      document.addEventListener(event, handler);
      this$1._listeners[event] = handler;
    });
  },
  beforeDestroy: function beforeDestroy () {
    var this$1 = this;

    for (var event in this$1._listeners) {
      document.removeEventListener(event, this$1._listeners[event]);
    }
  }
};

export default index;
