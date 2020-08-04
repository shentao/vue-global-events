let _isIE: boolean
export function isIE() {
  return _isIE == null
    ? (_isIE = /msie|trident/.test(window.navigator.userAgent.toLowerCase()))
    : _isIE
}
