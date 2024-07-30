import type { Ref } from 'vue'
import { computed, reactive, ref, shallowRef, toValue, watch } from 'vue'
import { $fetch, type MappedResponseType } from 'ofetch'
import { createContext } from './ctx'
import { useTimeoutPoll } from './utils/useTimeoutPoll'
import { useDebounceFn } from './utils/useDebounceFn'
import { useThrottleFn } from './utils/useThrottleFn'
import { toArray } from './utils/general'

import type {
  ResponseType,
  UseFetch,
  UseFetchOptions,
  UseFetchParams,
  UseFetchReturns,
  UseFetchStatus,
} from './types'

export const defaultOptionsKey = Symbol('defaultOptionsKey')

export function createUseFetch(defaultOptions: UseFetchOptions<any> = {}) {
  const useFetch: UseFetch = function <T = any, R extends ResponseType = ResponseType>(
    _req: UseFetchParams,
    options: UseFetchOptions<R> = {},
  ): UseFetchReturns<R, T> {
    const ctx = createContext<R>({ ...options, ...defaultOptions })

    const status = ref<UseFetchStatus>('idle')
    const pending = ref(false)
    const data: Ref<MappedResponseType<R, T> | null> = shallowRef(null)
    const error = ref<Error | null>(null)

    const req = computed(() => toValue(_req))

    const watchOptions = reactive(ctx.optionsWatch)

    const execute = async () => {
      await $fetch<T, R>(toValue(req), {
        ...ctx.options$fetch,
        ...Object.fromEntries(
          Object.entries(toValue(watchOptions)).map(([k, v]) => [k, toValue(v)]),
        ),
        onRequest(content) {
          status.value = 'pending'
          pending.value = true

          ctx.options$fetch?.onRequest?.(content)
        },
        onRequestError(content) {
          status.value = 'error'
          error.value = content.error

          ctx.options$fetch?.onRequestError?.(content)
        },
        onResponse(content) {
          data.value = content.response._data
          status.value = 'success'
          pending.value = false

          ctx.options$fetch?.onResponse?.(content)
        },
        onResponseError(content) {
          error.value = content.error ?? new Error('[useFetch] Unknown error caught in onResponseError')
          status.value = 'error'
          pending.value = false

          ctx.options$fetch?.onResponseError?.(content as any)
        },
      })
    }

    const _debounce_execute = ctx.optionsComposable.debounceInterval !== undefined
      ? useDebounceFn(execute, ctx.optionsComposable.debounceInterval)
      : execute
    const _throttle_execute = ctx.optionsComposable.throttleInterval !== undefined
      ? useThrottleFn(_debounce_execute, ctx.optionsComposable.throttleInterval)
      : _debounce_execute

    const _execute = () => toValue(ctx.optionsComposable.ready) ? _throttle_execute() : new Promise<void>(res => res())

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
        : [req, watchOptions, ...toArray(ctx.optionsComposable.watch || [])],
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

  useFetch.create = newDefaultOptions =>
    createUseFetch({ ...defaultOptions, ...newDefaultOptions })

  // @ts-expect-error - for internal use
  useFetch[defaultOptionsKey] = { ...defaultOptions }

  return useFetch
}
