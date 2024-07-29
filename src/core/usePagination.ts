import { computed, ref, toValue } from 'vue'
import { useFetch } from '..'
import type {
  ResponseType,
  UseFetchOptions,
  UseFetchParams,
  UsePagination,
  UsePaginationOptions,
  UsePaginationReturns,
} from './types'
import { objectGet, toArray } from './utils/general'
import { defaultOptionsKey } from './useFetch'

export function createUsePagination(defaultOptions: UsePaginationOptions<any> = {}) {
  const usePagination: UsePagination = function <T = any, R extends ResponseType = ResponseType>(
    _req: UseFetchParams,
    options: UsePaginationOptions<R> = {},
  ): UsePaginationReturns<R, T> {
    const {
      pageCurrentKey = 'current',
      pageSizeKey = 'pageSize',

      defaultPageSize = 10,

      totalKey = 'total',
      pageTotalKey = 'totalPage',

      ...useFetchOptions
    } = { ...defaultOptions, ...options }

    const pageSize = ref<number>(defaultPageSize)
    const pageCurrent = ref<number>(1)

    // @ts-expect-error - for internal use
    const useFetchDefaultOptions: UseFetchOptions = useFetch[defaultOptionsKey]

    const val = useFetch(_req, {
      ...useFetchOptions,
      watch: useFetchOptions.watch !== false && [pageSize, pageCurrent, ...toArray(useFetchOptions.watch || [])],
      onRequest(context) {
        useFetchDefaultOptions.onRequest?.(context)

        const assignPaginationKey = (p: Record<string, any> = {}) => ({
          ...p,
          [pageCurrentKey]: p[pageCurrentKey] || toValue(pageCurrent),
          [pageSizeKey]: p[pageSizeKey] || toValue(pageSize),
        })

        context.options.query = assignPaginationKey(context.options.query)
        context.options.params = assignPaginationKey(context.options.params)
        useFetchOptions?.onRequest?.(context)
      },
      onRequestError(context) {
        useFetchDefaultOptions.onRequestError?.(context)
        useFetchOptions.onRequestError?.(context)
      },
      onResponse(context) {
        useFetchDefaultOptions.onResponse?.(context)
        useFetchOptions.onResponse?.(context)
      },
      onResponseError(context) {
        useFetchDefaultOptions.onResponseError?.(context)
        useFetchOptions.onResponseError?.(context)
      },
    })

    const total = computed<number>(() => objectGet(val.data.value, totalKey, 0))
    const pageTotal = computed<number>(() => objectGet(val.data.value, pageTotalKey, Math.ceil(total.value / pageSize.value)))

    return {
      ...val,

      pageCurrent,
      pageSize,

      total,
      pageTotal,
    }
  }

  usePagination.create = newDefaultOptions => createUsePagination({ ...defaultOptions, ...newDefaultOptions })

  // @ts-expect-error - for internal use
  usePagination[defaultOptionsKey] = { ...defaultOptions }

  return usePagination
}
