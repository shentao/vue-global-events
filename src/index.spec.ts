import { describe, test, expect, vi, afterEach } from 'vitest'
import { GlobalEventsImpl as GlobalEvents } from './GlobalEvents'
import { mount, enableAutoUnmount } from '@vue/test-utils'
// @ts-expect-error: mocked
import ie from './isIE'

vi.mock('../src/isIE.ts')

describe('GlobalEvents', () => {
  enableAutoUnmount(afterEach)
  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
    vi.resetAllMocks()
  })
  test('transfer events', () => {
    const onKeydown = vi.fn()
    const onCallcontext = vi.fn()
    mount(GlobalEvents, {
      attrs: {
        onKeydown,
        onCallcontext,
      },
    })

    expect(onKeydown).not.toHaveBeenCalled()
    expect(onCallcontext).not.toHaveBeenCalled()

    document.dispatchEvent(new Event('keydown'))

    expect(onKeydown).toHaveBeenCalledTimes(1)
    expect(onCallcontext).not.toHaveBeenCalled()
  })

  test('filter out events', () => {
    const onKeydown = vi.fn()
    let called = false
    // easy to test filter that calls only the filst event
    const filter = () => {
      const shouldCall = !called
      called = true
      return shouldCall
    }
    mount(GlobalEvents, {
      attrs: { onKeydown },
      props: { filter },
    })
    expect(onKeydown).not.toHaveBeenCalled()

    document.dispatchEvent(new Event('keydown'))
    expect(onKeydown).toHaveBeenCalledTimes(1)

    document.dispatchEvent(new Event('keydown'))
    document.dispatchEvent(new Event('keydown'))
    document.dispatchEvent(new Event('keydown'))
    expect(onKeydown).toHaveBeenCalledTimes(1)
  })

  test('filter gets passed handler, and keyName', () => {
    const onKeydown = vi.fn()
    const filter = vi.fn()
    mount(GlobalEvents, {
      attrs: { onKeydown },
      props: { filter },
    })

    const event = new Event('keydown')
    document.dispatchEvent(event)
    expect(onKeydown).not.toHaveBeenCalled()

    // Vue will wrap the onKeydown listener, that's why we are checking for fns
    expect(filter).toHaveBeenCalledWith(event, expect.any(Function), 'keydown')
  })

  test('supports a global prevent modifier', async () => {
    return new Promise(async (resolve, reject) => {
      mount(GlobalEvents, {
        props: {
          prevent: true,
        },
        attrs: {
          onKeydown: (event: Event) => {
            try {
              expect(event.defaultPrevented).toBe(true)
              resolve(0)
            } catch (err) {
              reject(err)
            }
          },
        },
        attachTo: document.body,
      })

      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'a',
          bubbles: true,
          cancelable: true,
        })
      )
    })
  })

  test('supports a global stop modifier', async () => {
    return new Promise(async (resolve, reject) => {
      const event = new KeyboardEvent('keydown', {
        key: 'a',
        bubbles: true,
        cancelable: true,
      })
      const spy = vi.spyOn(event, 'stopPropagation')
      mount(GlobalEvents, {
        props: {
          stop: true,
        },
        attrs: {
          onKeydown: (event: Event) => {
            try {
              expect(spy).toHaveBeenCalled()
              resolve(0)
            } catch (err) {
              reject(err)
            }
          },
        },
        attachTo: document.body,
      })

      document.dispatchEvent(event)
    })
  })

  test('cleans up events', () => {
    const onKeydown = vi.fn()
    const onCallcontext = vi.fn()
    const wrapper = mount(GlobalEvents, {
      attrs: {
        onKeydown,
        onCallcontext,
      },
    })

    const spy = vi.spyOn(document, 'removeEventListener')

    wrapper.unmount()

    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function), undefined)
    expect(spy).toHaveBeenCalledWith(
      'callcontext',
      expect.any(Function),
      undefined
    )
  })

  test('cleans up events with modifiers', () => {
    const keydown = vi.fn()
    const wrapper = mount(GlobalEvents, {
      attrs: {
        onKeydownCapture: keydown,
      },
    })

    const spy = vi.spyOn(document, 'removeEventListener')

    wrapper.unmount()

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function), {
      capture: true,
    })
  })

  test('supports passive modifier', () => {
    const onKeydown = vi.fn()
    const spy = vi.spyOn(document, 'addEventListener')
    mount(GlobalEvents, {
      attrs: {
        onKeydownPassive: onKeydown,
      },
    })

    expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function), {
      passive: true,
    })
  })

  test('strips off modifiers from events', () => {
    const keydown = vi.fn()
    const spy = vi.spyOn(document, 'addEventListener')
    mount(GlobalEvents, {
      attrs: {
        onKeydownOnce: keydown,
      },
    })

    expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function), {
      once: true,
    })
  })

  test('supports capture modifier', () => {
    const keydown = vi.fn()
    const spy = vi.spyOn(document, 'addEventListener')
    mount(GlobalEvents, {
      attrs: {
        onKeydownCapture: keydown,
      },
    })

    expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function), {
      capture: true,
    })
  })

  test('supports once modifier', () => {
    const keydown = vi.fn()
    const spy = vi.spyOn(document, 'addEventListener')
    mount(GlobalEvents, {
      attrs: {
        onKeydownOnce: keydown,
      },
    })

    expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function), {
      once: true,
    })
  })

  test('supports multiple modifier', () => {
    const keydown = vi.fn()
    const spy = vi.spyOn(document, 'addEventListener')
    mount(GlobalEvents, {
      attrs: {
        onKeydownOnceCapture: keydown,
      },
    })

    expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function), {
      capture: true,
      once: true,
    })
  })

  test('passes a boolean instead of object if IE', () => {
    const keydown = vi.fn()
    const spy = vi.spyOn(document, 'addEventListener')
    ie.value = true
    mount(GlobalEvents, {
      attrs: {
        onKeydownOnceCapture: keydown,
        onKeydownOnce: keydown,
      },
    })
    ie.value = false

    expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function), true)
    expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function), false)
  })

  test('support different targets', () => {
    const keydown = vi.fn()
    const spy = vi.spyOn(window, 'addEventListener')
    mount(GlobalEvents, {
      props: {
        target: 'window',
      },
      attrs: {
        onKeydownOnceCapture: keydown,
      },
    })

    expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function), {
      capture: true,
      once: true,
    })
  })
})
