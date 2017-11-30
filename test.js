import { mount } from 'vue-test-utils'
import GlobalEvents from './src'

describe('GlobalEvents', () => {
  test('transfer events', () => {
    const keydown = jest.fn()
    const callcontext = jest.fn()
    const wrapper = mount(GlobalEvents, {
      listeners: {
        keydown,
        callcontext
      }
    })
    expect(keydown.mock.calls.length).toBe(0)
    expect(callcontext.mock.calls.length).toBe(0)

    document.dispatchEvent(new Event('keydown'))

    expect(keydown.mock.calls.length).toBe(1)
    expect(callcontext.mock.calls.length).toBe(0)

    wrapper.trigger('keydown')

    expect(keydown.mock.calls.length).toBe(1)
  })

  test('cleans up events', () => {
    const keydown = jest.fn()
    const callcontext = jest.fn()
    const wrapper = mount(GlobalEvents, {
      listeners: {
        keydown,
        callcontext
      }
    })

    document.removeEventListener = jest.fn()

    wrapper.destroy()

    expect(document.removeEventListener.mock.calls[0][0]).toBe('keydown')
    expect(document.removeEventListener.mock.calls[1][0]).toBe('callcontext')
  })
})
