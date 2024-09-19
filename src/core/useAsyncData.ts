import type { Ref } from 'vue'
import type {
  UseAsyncData,
  UseAsyncDataOptions,
  UseAsyncDataReturns,
  UseAsyncDataStatus,
} from './types'
import { ref, shallowRef, toValue, watch } from 'vue'
import { createContext } from './ctx'
import { toArray } from './utils/general'
import { pipe } from './utils/pipe'
import { useDebounceFn } from './utils/useDebounceFn'

import { useThrottleFn } from './utils/useThrottleFn'
import { useTimeoutPoll } from './utils/useTimeoutPoll'

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

    const executeRequest = async () => {
      try {
        // on request
        status.value = 'pending'
        pending.value = true

        data.value = await request()

        // on response
        status.value = 'success'
      }
      catch (e) {
        // on error
        error.value = e instanceof Error ? e : new Error(e as any)
        status.value = 'error'

        throw error.value
      }
      finally {
        // on finally
        pending.value = false
      }
    }

    const executePipe = pipe(
      (r: typeof executeRequest) => ctx.optionsComposable.debounceInterval !== undefined
        ? useDebounceFn(r, ctx.optionsComposable.debounceInterval)
        : r,
      r => ctx.optionsComposable.throttleInterval !== undefined
        ? useThrottleFn(r, ctx.optionsComposable.throttleInterval)
        : r,
    )(executeRequest)

    const _execute = () => toValue(ctx.optionsComposable.ready) ? executePipe() : Promise.resolve()

    let resume: (() => Promise<void>) | undefined

    let _isFirstRun = true
    if (ctx.optionsComposable.pollingInterval !== undefined) {
      const { resume: _ } = useTimeoutPoll(_execute, ctx.optionsComposable.pollingInterval)
      resume = () => {
        _isFirstRun = false
        return _()
      }
    }

    const execute = resume
      ? () => _isFirstRun ? resume() : _execute()
      : _execute

    if (ctx.optionsComposable.immediate)
      execute()

    watch(
      ctx.optionsComposable.watch === false
        ? []
        : [...toArray(ctx.optionsComposable.watch || [])],
      () => execute(),
    )

    return {
      data,
      pending,
      status,
      error,
      execute,
      refresh: execute,
    }
  }

  useAsyncData.create = newDefaultOptions =>
    createUseAsyncData({ ...defaultOptions, ...newDefaultOptions })

  return useAsyncData
}
