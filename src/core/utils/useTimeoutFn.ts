import type { MaybeRefOrGetter, Ref } from 'vue'
import { readonly, ref, toValue } from 'vue'
import type { AnyFn, Fn } from './types'
import { tryOnScopeDispose } from './vueuseVender'

export interface UseTimeoutFnOptions {
  /**
   * Start the timer immediate after calling this function
   *
   * @default true
   */
  immediate?: boolean
}

export function useTimeoutFn<CallbackFn extends AnyFn>(
  cb: CallbackFn,
  interval: MaybeRefOrGetter<number>,
  options: UseTimeoutFnOptions = {},
): Stoppable<Parameters<CallbackFn> | []> {
  const {
    immediate = true,
  } = options

  const isPending = ref(false)

  let timer: ReturnType<typeof setTimeout> | null = null

  function clear() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  function stop() {
    isPending.value = false
    clear()
  }

  function start(...args: Parameters<CallbackFn> | []) {
    clear()
    isPending.value = true
    timer = setTimeout(() => {
      isPending.value = false
      timer = null

      cb(...args)
    }, toValue(interval))
  }

  if (immediate) {
    isPending.value = true
    start()
  }

  tryOnScopeDispose(stop)

  return {
    isPending: readonly(isPending),
    start,
    stop,
  }
}

export interface Stoppable<StartFnArgs extends any[] = any[]> {
  /**
   * A ref indicate whether a stoppable instance is executing
   */
  isPending: Readonly<Ref<boolean>>

  /**
   * Stop the effect from executing
   */
  stop: Fn

  /**
   * Start the effects
   */
  start: (...args: StartFnArgs) => void
}
