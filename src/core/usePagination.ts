import { computed, ref, toValue } from 'vue'
import { useFetch } from '..'
import type {
  ResponseType,
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

    const assignPaginationKey = (p: Record<string, any> = {}) => ({
      ...p,
      [pageCurrentKey]: p[pageCurrentKey] || toValue(pageCurrent),
      [pageSizeKey]: p[pageSizeKey] || toValue(pageSize),
    })

    const val = useFetch(_req, {
      ...useFetchOptions,
      watch: useFetchOptions.watch === false ? [] : [pageSize, pageCurrent, ...toArray(useFetchOptions.watch || [])],
      onRequest(context) {
        context.options.query = assignPaginationKey(context.options.query)
        context.options.params = assignPaginationKey(context.options.params)
        useFetchOptions?.onRequest?.(context)
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
