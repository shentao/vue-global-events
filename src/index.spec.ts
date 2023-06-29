import { describe, test, expect, vi } from 'vitest'
import { GlobalEventsImpl as GlobalEvents } from './GlobalEvents'
import { mount } from '@vue/test-utils'
// @ts-expect-error: mocked
import ie from './isIE'
import { nextTick } from 'vue'

vi.mock('../src/isIE.ts')

describe('GlobalEvents', () => {
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

  test('cleans up events', () => {
    const onKeydown = vi.fn()
    const onCallcontext = vi.fn()
    const wrapper = mount(GlobalEvents, {
      attrs: {
        onKeydown,
        onCallcontext,
      },
    })

    const spy = (document.removeEventListener = vi.fn())

    wrapper.unmount()

    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function), undefined)
    expect(spy).toHaveBeenCalledWith(
      'callcontext',
      expect.any(Function),
      undefined
    )

    spy.mockRestore()
  })

  test('cleans up events with modifiers', () => {
    const keydown = vi.fn()
    const wrapper = mount(GlobalEvents, {
      attrs: {
        onKeydownCapture: keydown,
      },
    })

    const spy = (document.removeEventListener = vi.fn())

    wrapper.unmount()

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function), {
      capture: true,
    })

    spy.mockRestore()
  })

  test('supports passive modifier', () => {
    const onKeydown = vi.fn()
    const spy = (document.addEventListener = vi.fn())
    mount(GlobalEvents, {
      attrs: {
        onKeydownPassive: onKeydown,
      },
    })

    expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function), {
      passive: true,
    })

    spy.mockRestore()
  })

  test('strips off modifiers from events', () => {
    const keydown = vi.fn()
    const spy = (document.addEventListener = vi.fn())
    mount(GlobalEvents, {
      attrs: {
        onKeydownOnce: keydown,
      },
    })

    expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function), {
      once: true,
    })
    spy.mockRestore()
  })

  test('supports capture modifier', () => {
    const keydown = vi.fn()
    const spy = (document.addEventListener = vi.fn())
    mount(GlobalEvents, {
      attrs: {
        onKeydownCapture: keydown,
      },
    })

    expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function), {
      capture: true,
    })
    spy.mockRestore()
  })

  test('supports once modifier', () => {
    const keydown = vi.fn()
    const spy = (document.addEventListener = vi.fn())
    mount(GlobalEvents, {
      attrs: {
        onKeydownOnce: keydown,
      },
    })

    expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function), {
      once: true,
    })
    spy.mockRestore()
  })

  test('supports multiple modifier', () => {
    const keydown = vi.fn()
    const spy = (document.addEventListener = vi.fn())
    mount(GlobalEvents, {
      attrs: {
        onKeydownOnceCapture: keydown,
      },
    })

    expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function), {
      capture: true,
      once: true,
    })
    spy.mockRestore()
  })

  test.todo('supports a global prevent modifier', async () => {
    // expect.assertions(1)
    // return new Promise(async (resolve) => {
    mount(GlobalEvents, {
      props: {
        prevent: true,
      },
      attrs: {
        onKeydown: (event: Event) => {
          console.log('event', event)
          expect(event.defaultPrevented).toBe(true)
          // resolve(0)
        },
      },
      attachTo: document.body,
    })

    // await nextTick()

    expect(
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'a',
          bubbles: true,
          cancelable: true,
        })
      )
    ).toBe(false)
    // })
    await nextTick()
    await nextTick()
  })

  test('passes a boolean instead of object if IE', () => {
    const keydown = vi.fn()
    const spy = (document.addEventListener = vi.fn())
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
    spy.mockRestore()
  })

  test('support different targets', () => {
    const keydown = vi.fn()
    const spy = vi.spyOn(global.window, 'addEventListener')
    mount(GlobalEvents, {
      props: {
        target: 'window',
      },
      attrs: {
        onKeydownOnceCapture: keydown,
      },
    })

    expect(global.window.addEventListener).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
      { capture: true, once: true }
    )
    spy.mockRestore()
  })
})
