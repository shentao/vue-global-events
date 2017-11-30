/*!
 * vue-global-events v0.0.0
 * (c) 2017 Damian Dulisz
 * Released under the MIT License.
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.VueGlobalEvents = factory());
}(this, (function () { 'use strict';

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

return index;

})));
