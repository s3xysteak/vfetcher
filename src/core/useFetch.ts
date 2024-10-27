import type { ResponseType } from 'ofetch'
import type {
  UseFetch,
  UseFetchOptions,
  UseFetchParams,
  UseFetchReturns,
} from './types'
import { $fetch } from 'ofetch'
import { computed, reactive, toValue } from 'vue'
import { useAsyncData } from '..'
import { createContext } from './ctx'

import { toArray } from './utils/general'

export const defaultOptionsKey = Symbol('defaultOptionsKey')

export function createUseFetch(defaultOptions: UseFetchOptions<any, any> = {}) {
  const useFetch: UseFetch = function <ResT = any, DataT = ResT, R extends ResponseType = 'json'>(
    _req: UseFetchParams,
    options: UseFetchOptions<ResT, DataT, R> = {},
  ): UseFetchReturns<R, DataT> {
    const ctx = createContext<R>({ ...options, ...defaultOptions } as any)
    const watchOptions = reactive(ctx.optionsWatch)
    const req = computed(() => toValue(_req))

    return useAsyncData(
      () => $fetch(toValue(req), {
        ...ctx.options$fetch,
        ...Object.fromEntries(
          Object.entries(toValue(watchOptions)).map(([k, v]) => [k, toValue(v)]),
        ),
      }),
      {
        ...ctx.optionsComposable,
        watch: ctx.optionsComposable.watch === false
          ? []
          : [watchOptions, req, ...toArray(ctx.optionsComposable.watch || [])],
      },
    )
  }

  useFetch.create = newDefaultOptions =>
    createUseFetch({ ...defaultOptions, ...newDefaultOptions })

  // @ts-expect-error - for internal use
  useFetch[defaultOptionsKey] = { ...defaultOptions }

  return useFetch
}
