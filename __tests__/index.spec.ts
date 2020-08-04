import { GlobalEventsImpl as GlobalEvents } from '../src/GlobalEvents'
import { mount } from '@vue/test-utils'
// @ts-ignore
import ie from '../src/isIE'

jest.mock('../src/isIE.ts')

describe('GlobalEvents', () => {
  test('transfer events', () => {
    const onKeydown = jest.fn()
    const onCallcontext = jest.fn()
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
    const onKeydown = jest.fn()
    let called = false
    // easy to test filter that calls only the filst event
    const filter = () => {
      const shouldCall = !called
      called = true
      return shouldCall
    }
    mount(GlobalEvents, {
      attrs: { onKeydown },
      // @ts-ignore
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
    const onKeydown = jest.fn()
    const filter = jest.fn()
    mount(GlobalEvents, {
      attrs: { onKeydown },
      // @ts-ignore: should work
      props: { filter },
    })

    const event = new Event('keydown')
    document.dispatchEvent(event)
    expect(onKeydown).not.toHaveBeenCalled()

    // Vue will wrap the onKeydown listener, that's why we are checking for fns
    expect(filter).toHaveBeenCalledWith(event, expect.any(Function), 'keydown')
  })

  test('cleans up events', () => {
    const onKeydown = jest.fn()
    const onCallcontext = jest.fn()
    const wrapper = mount(GlobalEvents, {
      attrs: {
        onKeydown,
        onCallcontext,
      },
    })

    const spy = (document.removeEventListener = jest.fn())

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
    const keydown = jest.fn()
    const wrapper = mount(GlobalEvents, {
      attrs: {
        onKeydownCapture: keydown,
      },
    })

    const spy = (document.removeEventListener = jest.fn())

    wrapper.unmount()

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function), {
      capture: true,
    })

    spy.mockRestore()
  })

  test('supports passive modifier', () => {
    const onKeydown = jest.fn()
    const spy = (document.addEventListener = jest.fn())
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
    const keydown = jest.fn()
    const spy = (document.addEventListener = jest.fn())
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
    const keydown = jest.fn()
    const spy = (document.addEventListener = jest.fn())
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
    const keydown = jest.fn()
    const spy = (document.addEventListener = jest.fn())
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
    const keydown = jest.fn()
    const spy = (document.addEventListener = jest.fn())
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

  test('passes a boolean instead of object if IE', () => {
    const keydown = jest.fn()
    const spy = (document.addEventListener = jest.fn())
    // @ts-ignore
    ie.value = true
    mount(GlobalEvents, {
      attrs: {
        onKeydownOnceCapture: keydown,
        onKeydownOnce: keydown,
      },
    })
    // @ts-ignore
    ie.value = false

    expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function), true)
    expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function), false)
    spy.mockRestore()
  })

  test('support different targets', () => {
    const keydown = jest.fn()
    const spy = jest.spyOn(global.window, 'addEventListener')
    mount(GlobalEvents, {
      // @ts-ignore
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
