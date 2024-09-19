import type { MaybeRefOrGetter, Ref } from 'vue'
import type { Fn } from './types'

import type { UseTimeoutFnOptions } from './useTimeoutFn'
import { ref } from 'vue'
import { useTimeoutFn } from './useTimeoutFn'
import { tryOnScopeDispose } from './vueuseVender'

/**
 * @vueuse/core useTimeoutPoll
 *
 * ! The difference is `resume` is an async function here.
 */
export function useTimeoutPoll(
  fn: () => void | Promise<void>,
  interval: MaybeRefOrGetter<number>,
  timeoutPollOptions?: UseTimeoutFnOptions,
): UseTimeoutPollReturns {
  const { start } = useTimeoutFn(loop, interval, { immediate: false })

  const isActive = ref(false)

  async function loop() {
    if (!isActive.value)
      return

    await fn()
    start()
  }

  async function resume() {
    if (!isActive.value) {
      isActive.value = true
      await loop()
    }
  }

  function pause() {
    isActive.value = false
  }

  if (timeoutPollOptions?.immediate)
    resume()

  tryOnScopeDispose(pause)

  return {
    isActive,
    pause,
    resume,
  }
}

export interface UseTimeoutPollReturns {
  /**
   * A ref indicate whether a pausable instance is active
   */
  isActive: Readonly<Ref<boolean>>

  /**
   * Temporary pause the effect from executing
   */
  pause: Fn

  /**
   * Resume the effects
   */
  resume: () => Promise<void>
}
