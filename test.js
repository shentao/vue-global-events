import { mount } from '@vue/test-utils'
import GlobalEvents from './src'
// eslint-disable-next-line import/default
import ie from './src/utils'

jest.mock('./src/utils')

describe('GlobalEvents', () => {
  let wrapper
  afterEach(() => {
    wrapper.destroy()
  })

  test('transfer events', () => {
    const keydown = jest.fn()
    const callcontext = jest.fn()
    wrapper = mount(GlobalEvents, {
      listeners: {
        keydown,
        callcontext
      }
    })
    expect(keydown).not.toHaveBeenCalled()
    expect(callcontext).not.toHaveBeenCalled()

    document.dispatchEvent(new Event('keydown'))

    expect(keydown).toHaveBeenCalledTimes(1)
    expect(callcontext).not.toHaveBeenCalled()
  })

  test('filter out events', () => {
    const keydown = jest.fn()
    let called = false
    // easy to test filter that calls only the filst event
    const filter = event => {
      const shouldCall = !called
      called = true
      return shouldCall
    }
    wrapper = mount(GlobalEvents, {
      listeners: { keydown },
      propsData: { filter }
    })
    expect(keydown).not.toHaveBeenCalled()

    document.dispatchEvent(new Event('keydown'))
    expect(keydown).toHaveBeenCalledTimes(1)

    document.dispatchEvent(new Event('keydown'))
    document.dispatchEvent(new Event('keydown'))
    document.dispatchEvent(new Event('keydown'))
    expect(keydown).toHaveBeenCalledTimes(1)
  })

  test('filter gets passed handler, and keyName', () => {
    const keydown = jest.fn()
    const filter = jest.fn()
    wrapper = mount(GlobalEvents, {
      listeners: { keydown },
      propsData: { filter }
    })

    const event = new Event('keydown')
    document.dispatchEvent(event)
    expect(keydown).not.toHaveBeenCalled()

    // Vue will wrap the keydown listener, that's why we are checking for fns
    expect(filter).toHaveBeenCalledWith(
      event,
      expect.objectContaining({
        fns: keydown
      }),
      'keydown'
    )
  })

  test('cleans up events', () => {
    const keydown = jest.fn()
    const callcontext = jest.fn()
    wrapper = mount(GlobalEvents, {
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
    wrapper = mount(GlobalEvents, {
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

  test('passes a boolean instead of object if IE', () => {
    const keydown = jest.fn()
    document.addEventListener = jest.fn()
    // eslint-disable-next-line import/namespace
    ie.value = true
    mount(GlobalEvents, {
      listeners: {
        '~!keydown': keydown,
        '~keydown': keydown
      }
    })
    // eslint-disable-next-line import/namespace
    ie.value = false

    expect(document.addEventListener.mock.calls[0][2]).toEqual(true)
    expect(document.addEventListener.mock.calls[1][2]).toEqual(false)
    document.addEventListener.mockRestore()
  })
})
