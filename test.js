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

    document.removeEventListener.mockRestore()
  })

  test('cleans up events with modifiers', () => {
    const keydown = jest.fn()
    const wrapper = mount(GlobalEvents, {
      listeners: {
        '!keydown': keydown
      }
    })

    document.removeEventListener = jest.fn()

    wrapper.destroy()

    expect(document.removeEventListener.mock.calls[0][0]).toBe('keydown')

    document.removeEventListener.mockRestore()
  })

  test('supports passive modifier', () => {
    const keydown = jest.fn()
    document.addEventListener = jest.fn()
    mount(GlobalEvents, {
      listeners: {
        '&keydown': keydown
      }
    })

    expect(document.addEventListener.mock.calls[0][2]).toEqual({
      passive: true
    })
    document.addEventListener.mockRestore()
  })

  test('strips off modifiers from events', () => {
    const keydown = jest.fn()
    document.addEventListener = jest.fn()
    mount(GlobalEvents, {
      listeners: {
        '~keydown': keydown
      }
    })

    expect(document.addEventListener.mock.calls[0][0]).toBe('keydown')
    document.addEventListener.mockRestore()
  })

  test('supports capture modifier', () => {
    const keydown = jest.fn()
    document.addEventListener = jest.fn()
    mount(GlobalEvents, {
      listeners: {
        '!keydown': keydown
      }
    })

    expect(document.addEventListener.mock.calls[0][2]).toEqual({
      capture: true
    })
    document.addEventListener.mockRestore()
  })

  test('supports once modifier', () => {
    const keydown = jest.fn()
    document.addEventListener = jest.fn()
    mount(GlobalEvents, {
      listeners: {
        '~keydown': keydown
      }
    })

    expect(document.addEventListener.mock.calls[0][2]).toEqual({
      once: true
    })
    document.addEventListener.mockRestore()
  })

  test('supports multiple modifier', () => {
    const keydown = jest.fn()
    document.addEventListener = jest.fn()
    mount(GlobalEvents, {
      listeners: {
        '~!keydown': keydown
      }
    })

    expect(document.addEventListener.mock.calls[0][2]).toEqual({
      capture: true,
      once: true
    })
    document.addEventListener.mockRestore()
  })
})
