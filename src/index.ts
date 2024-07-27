import { createUseFetch } from './core/useFetch'

export const useFetch = createUseFetch()

// types
export type {
  UseFetch,
  UseFetchParams,
  UseFetchOptions,
  UseFetchReturns,
  UseFetchStatus,
  UseFetchReactiveOptions,
} from './core/types'
