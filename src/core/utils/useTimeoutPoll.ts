import type { MaybeRefOrGetter, Ref } from 'vue'
import { ref } from 'vue'

import type { UseTimeoutFnOptions } from './useTimeoutFn'
import { useTimeoutFn } from './useTimeoutFn'
import { tryOnScopeDispose } from './general'
import type { Fn } from './types'

/** @vueuse/core useTimeoutPoll */
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

  function resume() {
    if (!isActive.value) {
      isActive.value = true
      loop()
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

interface UseTimeoutPollReturns {
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
  resume: Fn
}
