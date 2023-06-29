import { GlobalEventsImpl as GlobalEvents } from '../src/GlobalEvents'
import { mount } from '@vue/test-utils'
import { defineComponent, KeepAlive, nextTick } from 'vue'
import { describe, test, expect, vi } from 'vitest'

const TestWrapper = (name: string, fn: Function) =>
  defineComponent({
    template: `
<keep-alive>
  <GlobalEvents :${name}="fn" v-if="active" />
</keep-alive>
  `,

    components: { KeepAlive, GlobalEvents },
    data: () => ({ active: true }),
    methods: { fn },
  })

describe('GlobalEvents with KeepAlive', () => {
  test('skips events when deactivated', async () => {
    const onKeydown = vi.fn()
    const wrapper = mount(TestWrapper('onKeydown', onKeydown))

    wrapper.vm.active = false
    await nextTick()

    document.dispatchEvent(new Event('keydown'))
    expect(onKeydown).not.toHaveBeenCalled()

    wrapper.vm.active = true
    await nextTick()

    expect(onKeydown).not.toHaveBeenCalled()
    document.dispatchEvent(new Event('keydown'))
    expect(onKeydown).toHaveBeenCalledTimes(1)
  })
})
