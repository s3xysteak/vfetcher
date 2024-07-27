import type { Ref } from 'vue'
import { computed, reactive, ref, shallowRef, toValue, watch } from 'vue'
import { $fetch, type MappedResponseType } from 'ofetch'
import type { ResponseType, UseFetchOptions, UseFetchParams, UseFetchReturns, UseFetchStatus } from './types'
import { createContext } from './ctx'
import { useTimeoutPoll } from './utils/useTimeoutPoll'
import { useDebounceFn } from './utils/useDebounceFn'
import { useThrottleFn } from './utils/useThrottleFn'
import { toArray } from './utils/general'

export function useFetch<T = any, R extends ResponseType = ResponseType>(
  _req: UseFetchParams,
  options?: UseFetchOptions<R>,
): UseFetchReturns<R, T> {
  const ctx = createContext<R>(options ?? {})

  const status = ref<UseFetchStatus>('idle')
  const pending = ref(false)
  const data: Ref<MappedResponseType<R, T> | null> = shallowRef(null)
  const error = ref<Error | null>(null)

  const req = computed(() => toValue(_req))

  const watchOptions = reactive(ctx.optionsWatch)

  const execute = async () => {
    status.value = 'pending'
    pending.value = true

    data.value = await $fetch<T, R>(toValue(req), {
      ...ctx.options$fetch,
      ...Object.fromEntries(
        Object.entries(toValue(watchOptions)).map(([k, v]) => [k, toValue(v)]),
      ),
      onResponse($fetchCtx) {
        status.value = 'success'
        ctx.options$fetch?.onResponse?.($fetchCtx)
      },
      onRequestError($fetchCtx) {
        status.value = 'error'
        error.value = $fetchCtx.error
        ctx.options$fetch?.onResponseError?.($fetchCtx as any)
      },
    })

    pending.value = false
  }

  const _execute = ctx.optionsComposable.debounceInterval !== undefined
    ? useDebounceFn(execute, ctx.optionsComposable.debounceInterval)
    : execute
  const $execute = ctx.optionsComposable.throttleInterval !== undefined
    ? useThrottleFn(_execute, ctx.optionsComposable.throttleInterval)
    : _execute

  const pollingInterval = ctx.optionsComposable.pollingInterval
  if (pollingInterval !== undefined)
    useTimeoutPoll($execute, pollingInterval, { immediate: ctx.optionsComposable.immediate })

  if (ctx.optionsComposable.immediate
    && pollingInterval === undefined) {
    $execute()
  }

  watch(
    ctx.optionsComposable.watch === false
      ? []
      : [req, watchOptions, ...(ctx.optionsComposable.watch ? toArray(ctx.optionsComposable.watch) : [])],
    () => $execute(),
  )

  return {
    data,
    pending,
    status,
    error,
    execute: $execute,
    refresh: $execute,
  }
}
