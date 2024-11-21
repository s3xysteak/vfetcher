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

type ExecutionPipeFn = (ctx: ReturnType<typeof createContext>) => (r: () => Promise<void>) => () => Promise<void>

const debounce: ExecutionPipeFn = (ctx) => {
  return r => ctx.optionsComposable.debounceInterval !== undefined
    ? useDebounceFn(r, ctx.optionsComposable.debounceInterval)
    : r
}
const throttle: ExecutionPipeFn = (ctx) => {
  return r => ctx.optionsComposable.throttleInterval !== undefined
    ? useThrottleFn(r, ctx.optionsComposable.throttleInterval)
    : r
}
const polling: ExecutionPipeFn = (ctx) => {
  return (r) => {
    if (ctx.optionsComposable.pollingInterval === undefined)
      return r

    const { resume, isActive } = useTimeoutPoll(r, ctx.optionsComposable.pollingInterval)

    return () => isActive.value ? r() : resume()
  }
}

export function createUseAsyncData(defaultOptions: UseAsyncDataOptions<any, any> = {}) {
  const useAsyncData: UseAsyncData = function <ResT = any, DataT = ResT>(
    request: () => Promise<ResT>,
    options: UseAsyncDataOptions<ResT, DataT> = {},
  ): UseAsyncDataReturns<DataT> {
    const ctx: { optionsComposable: ReturnType<typeof createContext>['optionsComposable'] }
    = createContext({ ...options, ...defaultOptions })

    const status = ref<UseAsyncDataStatus>('idle')
    const pending = ref(false)
    const data: Ref<DataT | null> = shallowRef(ctx.optionsComposable.default())
    const error = ref<Error | null>(null)

    const executeRequest = async () => {
      try {
        // on request
        status.value = 'pending'
        pending.value = true

        data.value = await ctx.optionsComposable.transform(await request())

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

    const executionPipe = [debounce, throttle, polling]

    const executePipe: () => Promise<void> = pipe(...executionPipe.map(fn => fn(ctx as any)))(executeRequest)

    const execute = () => toValue(ctx.optionsComposable.ready) ? executePipe() : Promise.resolve()

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
