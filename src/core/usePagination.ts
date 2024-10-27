import type { ResponseType } from 'ofetch'
import type {
  UseFetchParams,
  UsePagination,
  UsePaginationOptions,
  UsePaginationReturns,
} from './types'
import { computed, ref, toValue } from 'vue'
import { useFetch } from '..'
import { defaultOptionsKey } from './useFetch'
import { get, toArray } from './utils/general'

export function createUsePagination(defaultOptions: UsePaginationOptions<any, any> = {}) {
  const usePagination: UsePagination = function <ResT = any, DataT = ResT, R extends ResponseType = ResponseType>(
    _req: UseFetchParams,
    options: UsePaginationOptions<ResT, DataT, R> = {},
  ): UsePaginationReturns<R, DataT> {
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
      ...useFetchOptions as any,
      watch: useFetchOptions.watch === false ? [] : [pageSize, pageCurrent, ...toArray(useFetchOptions.watch || [])],
      onRequest: [
        (context) => {
          context.options.query = assignPaginationKey(context.options.query)
          context.options.params = assignPaginationKey(context.options.params)
        },
        ...toArray(useFetchOptions?.onRequest).filter(Boolean),
      ],
    })

    const total = computed<number>(() => get(val.data.value, totalKey, 0))
    const pageTotal = computed<number>(() => get(val.data.value, pageTotalKey, Math.ceil(total.value / pageSize.value)))

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
