export function log (text) {
  return function (event) {
    console.log({
      text,
      target: event.target,
      event,
    })
  }
}
