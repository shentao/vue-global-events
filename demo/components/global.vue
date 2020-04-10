<template>
  <section>
    <h1>Global</h1>
    <p>Press
      <code>ctrl+c</code>
      <code>ctrl+v</code>
      <code>ctrl+tab</code>
      <code>ctrl+shift+tab</code>
      <code>space</code>
      <code>ctrl+enter</code>
    </p>
    <GlobalEvents
      @keypress.ctrl.c="copy"
      @keypress.ctrl.v="paste"
      @keypress.prevent.ctrl.tab.exact="forward"
      @keypress.prevent.ctrl.shift.tab.exact="backward"
      @keyup.space.exact="space"
      @keypress.ctrl.enter="enter"
    />
  </section>
</template>

<script>
import { log } from './utils'

export default {
  methods: {
    copy: log('ctrl+c (global)'),
    paste: log('ctrl+v (global)'),
    forward: log('forward'),
    backward: log('backward'),
    space: log('space'),
    enter: log('ctrl+enter')
  }
}
</script>

<style>

</style>
