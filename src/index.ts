import { createUseFetch } from './core/useFetch'
import { createUsePagination } from './core/usePagination'

export const useFetch = createUseFetch()
export const usePagination = createUsePagination()

// types
export type {
  // useFetch
  UseFetch,
  UseFetchParams,
  UseFetchOptions,
  UseFetchReturns,
  UseFetchStatus,
  UseFetchReactiveOptions,

  // usePagination
  UsePagination,
  UsePaginationOptions,
  UsePaginationReturns,
} from './core/types'
