import type { Ref } from 'vue'
import { ref, shallowRef, toValue, watch } from 'vue'
import { createContext } from './ctx'
import { useTimeoutPoll } from './utils/useTimeoutPoll'
import { useDebounceFn } from './utils/useDebounceFn'
import { useThrottleFn } from './utils/useThrottleFn'
import { toArray } from './utils/general'

import type {
  UseAsyncData,
  UseAsyncDataOptions,
  UseAsyncDataReturns,
  UseAsyncDataStatus,
} from './types'

export function createUseAsyncData(defaultOptions: UseAsyncDataOptions = {}) {
  const useAsyncData: UseAsyncData = function <T = any>(
    request: () => Promise<T>,
    options: UseAsyncDataOptions = {},
  ): UseAsyncDataReturns<T> {
    const ctx: { optionsComposable: ReturnType<typeof createContext>['optionsComposable'] }
    = createContext({ ...options, ...defaultOptions })

    const status = ref<UseAsyncDataStatus>('idle')
    const pending = ref(false)
    const data: Ref<T | null> = shallowRef(null)
    const error = ref<Error | null>(null)

    const execute = async () => {
      try {
        // on request
        status.value = 'pending'
        pending.value = true

        data.value = await request()

        // on response
        status.value = 'success'
        pending.value = false
      }
      catch (e) {
        // on error
        error.value = e instanceof Error ? e : new Error(e as any)
        status.value = 'error'
        pending.value = false

        throw error.value
      }
    }

    const _debounce_execute = ctx.optionsComposable.debounceInterval !== undefined
      ? useDebounceFn(execute, ctx.optionsComposable.debounceInterval)
      : execute
    const _throttle_execute = ctx.optionsComposable.throttleInterval !== undefined
      ? useThrottleFn(_debounce_execute, ctx.optionsComposable.throttleInterval)
      : _debounce_execute

    const _execute = () => toValue(ctx.optionsComposable.ready) ? _throttle_execute() : Promise.resolve()

    const pollingInterval = ctx.optionsComposable.pollingInterval
    if (pollingInterval !== undefined)
      useTimeoutPoll(_execute, pollingInterval, { immediate: ctx.optionsComposable.immediate })

    if (ctx.optionsComposable.immediate
      && pollingInterval === undefined) {
      _execute()
    }

    watch(
      ctx.optionsComposable.watch === false
        ? []
        : [...toArray(ctx.optionsComposable.watch || [])],
      () => _execute(),
    )

    return {
      data,
      pending,
      status,
      error,
      execute: _execute,
      refresh: _execute,
    }
  }

  useAsyncData.create = newDefaultOptions =>
    createUseAsyncData({ ...defaultOptions, ...newDefaultOptions })

  // @ts-expect-error - for internal use
  useAsyncData[defaultOptionsKey] = { ...defaultOptions }

  return useAsyncData
}
