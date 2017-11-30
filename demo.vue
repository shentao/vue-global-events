<template>
<div>
  <h1>Press ctrl+tab | ctrl+shift+tab | space | ctrl+enter</h1>
  <GlobalEvents
    @keypress.ctrl.tab.exact="forward"
    @keypress.ctrl.shift.tab.exact="backward"
    @keyup.space.exact="space"
    @keypress.ctrl.enter="enter"
  />
</div>
</template>

<script>
import GlobalEvents from './src/index'

export default {
  components: { GlobalEvents },
  methods: {
    forward () {
      console.log('forward')
    },
    backward (e) {
      console.log('backward', e)
    },
    space (e) {
      console.log('space', e)
    },
    enter () {
      console.log('enter')
    }
  }
}
</script>

<style>

</style>
