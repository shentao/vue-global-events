<template>
  <div>
    <section tabindex="1">
      <h1>Local</h1>
      <p>Click this section, or the textarea, and press
        <code>ctrl+c</code>
        <code>ctrl+v</code>
      </p>
      <textarea ref="textarea">Some text</textarea>
      <!--
        Try changing the target prop below to:

          // reference
          :target="$el"

          // keyword
          target="$parent"

          // css selector
          target="textarea"
      -->
      <GlobalEvents
        target="$parent"
        @keypress.ctrl.c.stop.prevent="copy"
        @keypress.ctrl.v.stop.prevent="paste"
      />
    </section>
  </div>
</template>

<script>
import { log } from './utils'

export default {
  methods: {
    copy: log('ctrl+c (local)'),
    paste: log('ctrl+v (local)')
  }
}
</script>

<style>

</style>
