<template>
  <div>
    <GlobalExample/>
    <LocalExample/>
    <p class="info">Check console for output</p>
  </div>
</template>

<script>
import GlobalExample from './components/global.vue'
import LocalExample from './components/local.vue'

export default {
  components: {
    GlobalExample,
    LocalExample
  }
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: AppleSystemUIFont, Segoe UI, sans-serif;
  line-height: 1.7em;
}

section {
  margin: 1rem;
  padding: 1rem;
  border: 1px solid #EEE;
}

code {
  background: #555;
  border-radius: 4px;
  padding: 2px 5px;
  margin: 0 .15rem;
  font-family: Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: .9em;
  color: white;
}

.info {
  margin: 1rem 1.5rem;
  font-size: .9em;
  font-style: italic;
  color: #AAA;
}
</style>
