import type { MaybeRefOrGetter } from 'vue'
import type { AnyFn, PromisifyFn } from './types'
import { isRef, toValue } from 'vue'
import { noop } from './general'
import { createFilterWrapper, type EventFilter, type FunctionArgs } from './vueuseVender'

/**
 * Throttle execution of a function. Especially useful for rate limiting
 * execution of handlers on events like resize and scroll.
 *
 * @param   fn             A function to be executed after delay milliseconds. The `this` context and all arguments are passed through, as-is,
 *                                    to `callback` when the throttled-function is executed.
 * @param   ms             A zero-or-greater delay in milliseconds. For event callbacks, values around 100 or 250 (or even higher) are most useful.
 *                                    (default value: 200)
 *
 * @param [trailing] if true, call fn again after the time is up (default value: false)
 *
 * @param [leading] if true, call fn on the leading edge of the ms timeout (default value: true)
 *
 * @param [rejectOnCancel] if true, reject the last call if it's been cancel (default value: false)
 *
 * @return  A new, throttled, function.
 */
export function useThrottleFn<T extends FunctionArgs>(
  fn: T,
  ms: MaybeRefOrGetter<number> = 200,
  trailing = false,
  leading = true,
  rejectOnCancel = false,
): PromisifyFn<T> {
  return createFilterWrapper(
    throttleFilter(ms, trailing, leading, rejectOnCancel),
    fn,
  )
}

/**
 * Create an EventFilter that throttle the events
 *
 * @param ms
 * @param [trailing]
 * @param [leading]
 * @param [rejectOnCancel]
 */
export function throttleFilter(ms: MaybeRefOrGetter<number>, trailing?: boolean, leading?: boolean, rejectOnCancel?: boolean): EventFilter
export function throttleFilter(options: ThrottleFilterOptions): EventFilter
export function throttleFilter(...args: any[]) {
  let lastExec = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  let isLeading = true
  let lastRejector: AnyFn = noop
  let lastValue: any
  let ms: MaybeRefOrGetter<number>
  let trailing: boolean
  let leading: boolean
  let rejectOnCancel: boolean
  if (!isRef(args[0]) && typeof args[0] === 'object')
    ({ delay: ms, trailing = true, leading = true, rejectOnCancel = false } = args[0])
  else
    [ms, trailing = true, leading = true, rejectOnCancel = false] = args
  const clear = () => {
    if (timer) {
      clearTimeout(timer)
      timer = undefined
      lastRejector()
      lastRejector = noop
    }
  }

  const filter: EventFilter = (_invoke) => {
    const duration = toValue(ms)
    const elapsed = Date.now() - lastExec
    const invoke = () => {
      return lastValue = _invoke()
    }

    clear()

    if (duration <= 0) {
      lastExec = Date.now()
      return invoke()
    }

    if (elapsed > duration && (leading || !isLeading)) {
      lastExec = Date.now()
      invoke()
    }
    else if (trailing) {
      lastValue = new Promise((resolve, reject) => {
        lastRejector = rejectOnCancel ? reject : resolve
        timer = setTimeout(() => {
          lastExec = Date.now()
          isLeading = true
          resolve(invoke())
          clear()
        }, Math.max(0, duration - elapsed))
      })
    }

    if (!leading && !timer)
      timer = setTimeout(() => isLeading = true, duration)

    isLeading = false
    return lastValue
  }

  return filter
}

export interface ThrottleFilterOptions {
  /**
   * The maximum time allowed to be delayed before it's invoked.
   */
  delay: MaybeRefOrGetter<number>
  /**
   * Whether to invoke on the trailing edge of the timeout.
   */
  trailing?: boolean
  /**
   * Whether to invoke on the leading edge of the timeout.
   */
  leading?: boolean
  /**
   * Whether to reject the last call if it's been cancel.
   */
  rejectOnCancel?: boolean
}
