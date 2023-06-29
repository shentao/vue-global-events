import {
  defineComponent,
  onMounted,
  onBeforeUnmount,
  ref,
  onActivated,
  onDeactivated,
} from 'vue'
import type { PropType, VNodeProps } from 'vue'
import { isIE } from './isIE'

const EVENT_NAME_RE = /^on(\w+?)((?:Once|Capture|Passive)*)$/
const MODIFIERS_SEPARATOR_RE = /[OCP]/g

export interface GlobalEventsProps {
  target?: Exclude<keyof Window, number>
  filter?: EventFilter
}

export type EventFilter = (
  event: Event,
  listener: EventListener,
  name: string
) => any

type Options = AddEventListenerOptions & EventListenerOptions

function extractEventOptions(
  modifiersRaw: string | undefined
): Options | undefined | boolean {
  if (!modifiersRaw) return

  // IE only supports capture option and it has to be a boolean
  // https://github.com/shentao/vue-global-events/issues/14
  if (isIE()) {
    return modifiersRaw.includes('Capture')
  }

  const modifiers = modifiersRaw
    .replace(MODIFIERS_SEPARATOR_RE, ',$&')
    .toLowerCase()
    // remove the initial comma
    .slice(1)
    .split(',') as Array<'capture' | 'passive' | 'once'>

  return modifiers.reduce((options, modifier) => {
    options[modifier] = true
    return options
  }, {} as Options)
}

export const GlobalEventsImpl = defineComponent({
  name: 'GlobalEvents',

  props: {
    target: {
      type: String,
      default: 'document',
    },
    filter: {
      type: Function as PropType<EventFilter>,
      default: () => () => true,
    },

    // global event options
    stop: Boolean,
    prevent: Boolean,
    // Cannot be implemented because we don't have access to other modifiers at runtime
    // exact: Boolean,
  },

  setup(props, { attrs }) {
    let activeListeners: Record<
      string,
      [EventListener[], string, Options | undefined | boolean]
    > = Object.create(null)

    const isActive = ref(true)
    onActivated(() => {
      isActive.value = true
    })
    onDeactivated(() => {
      isActive.value = false
    })

    onMounted(() => {
      Object.keys(attrs)
        .filter((name) => name.startsWith('on'))
        .forEach((eventNameWithModifiers) => {
          const listener = attrs[eventNameWithModifiers] as
            | EventListener
            | EventListener[]
          const listeners = Array.isArray(listener) ? listener : [listener]
          const match = eventNameWithModifiers.match(EVENT_NAME_RE)

          if (!match) {
            if (__DEV__) {
              console.warn(
                `[vue-global-events] Unable to parse "${eventNameWithModifiers}". If this should work, you should probably open a new issue on https://github.com/shentao/vue-global-events.`
              )
            }
            return
          }

          let [, eventName, modifiersRaw] = match
          eventName = eventName.toLowerCase()

          const handlers: EventListener[] = listeners.map(
            (listener) => (event) => {
              if (isActive.value && props.filter(event, listener, eventName)) {
                if (props.stop) event.stopPropagation()
                if (props.prevent) event.preventDefault()
                listener(event)
              }
            }
          )

          const options = extractEventOptions(modifiersRaw)

          handlers.forEach((handler) => {
            ;(window[props.target as keyof Window] as Element).addEventListener(
              eventName,
              handler,
              options
            )
          })

          activeListeners[eventNameWithModifiers] = [
            handlers,
            eventName,
            options,
          ]
        })
    })

    onBeforeUnmount(() => {
      for (const eventNameWithModifiers in activeListeners) {
        const [handlers, eventName, options] = activeListeners[
          eventNameWithModifiers
        ]
        handlers.forEach((handler) => {
          ;(window[
            props.target as keyof Window
          ] as Element).removeEventListener(eventName, handler, options)
        })
      }

      activeListeners = {}
    })

    return () => null
  },
})

// export the public type for h/tsx inference
// also to avoid inline import() in generated d.ts files
/**
 * Component of vue-lib.
 */
export const GlobalEvents = (GlobalEventsImpl as any) as {
  new (): {
    $props: VNodeProps & GlobalEventsProps
  }
}
