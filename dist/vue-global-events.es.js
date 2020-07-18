/**
 * vue-global-events v1.1.2
 * (c) 2020 Damian Dulisz <damian.dulisz@gmail.com>, Eduardo San Martin Morote <posva13@gmail.com>
 * @license MIT
 */

var _isIE;
function isIE () {
  return _isIE == null
    ? (_isIE = /msie|trident/.test(window.navigator.userAgent.toLowerCase()))
    : _isIE
}

var modifiersRE = /^[~!&]*/;
var nonEventNameCharsRE = /\W+/;
var names = {
  '!': 'capture',
  '~': 'once',
  '&': 'passive'
};

function extractEventOptions (eventDescriptor) {
  var ref = eventDescriptor.match(modifiersRE);
  var modifiers = ref[0];

  // IE only supports capture option and it has to be a boolean
  // https://github.com/shentao/vue-global-events/issues/14
  if (isIE()) {
    return modifiers.indexOf('!') > -1
  }

  return modifiers.split('').reduce(function (options, modifier) {
    options[names[modifier]] = true;
    return options
  }, {})
}

var index = {
  name: 'GlobalEvents',
  props: {
    target: {
      type: String,
      default: 'document'
    },
    filter: {
      type: Function,
      default: function (e) { return true; }
    }
  },

  render: function () { return null; },

  mounted: function mounted () {
    var this$1 = this;

    this._listeners = Object.create(null);
    // @TODO move this regex out of mounted
    var regex = /^on[A-Z]/;
    Object.keys(this.$attrs)
      .filter(function (attr) { return regex.test(attr); })
      .forEach(function (attr) {
        var listener = this$1.$attrs[attr];
        var event = attr.slice(2).toLowerCase();
        var handler = function (e) {
          this$1.filter(e, listener, event) && listener(e);
        };
        window[this$1.target].addEventListener(
          event.replace(nonEventNameCharsRE, ''),
          handler,
          extractEventOptions(event)
        );
        this$1._listeners[event] = handler;
      });
  },

  beforeUnmount: function beforeUnmount () {
    var this$1 = this;

    for (var event in this$1._listeners) {
      window[this$1.target].removeEventListener(
        event.replace(nonEventNameCharsRE, ''),
        this$1._listeners[event],
        extractEventOptions(event)
      );
    }
  }
};

export default index;
