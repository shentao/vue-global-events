import { mount } from 'vue-test-utils'
import GlobalEvents from './src'

describe('GlobalEvents', () => {
  test('is a Vue instance', () => {
    const wrapper = mount(GlobalEvents)
    expect(wrapper.isVueInstance()).toBeTruthy()
  })
})
