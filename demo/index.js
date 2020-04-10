import Vue from 'vue'
import Demo from './demo.vue'
import GlobalEvents from '../src'

Vue.component('GlobalEvents', GlobalEvents)

new Vue({
  el: '#app',
  render: h => h(Demo)
})
