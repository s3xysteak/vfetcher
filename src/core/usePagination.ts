import { computed, ref, toValue } from 'vue'
import { useFetch as defaultUseFetch } from '..'
import type {
  ResponseType,
  UseFetchParams,
  UsePagination,
  UsePaginationOptions,
  UsePaginationReturns,
} from './types'
import { objectGet, toArray } from './utils/general'

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

      useFetch = defaultUseFetch,
      ...useFetchOptions
    } = Object.assign(defaultOptions, options)

    const pageSize = ref<number>(defaultPageSize)
    const pageCurrent = ref<number>(1)

    const val = useFetch(_req, {
      ...useFetchOptions,
      watch: useFetchOptions.watch !== false && [pageSize, pageCurrent, ...toArray(useFetchOptions.watch || [])],
      onRequest(ctx) {
        const assignPaginationKey = (p: Record<string, any> = {}) =>
          Object.assign(p, {
            [pageCurrentKey]: p[pageCurrentKey] || toValue(pageCurrent),
            [pageSizeKey]: p[pageSizeKey] || toValue(pageSize),
          })

        ctx.options.query = assignPaginationKey(ctx.options.query)
        ctx.options.params = assignPaginationKey(ctx.options.params)
        useFetchOptions?.onRequest?.(ctx)
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

  usePagination.create = newDefaultOptions => createUsePagination(Object.assign(defaultOptions, newDefaultOptions))

  return usePagination
}
