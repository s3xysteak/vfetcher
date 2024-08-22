import { createUseAsyncData } from './core/useAsyncData'
import { createUseFetch } from './core/useFetch'
import { createUsePagination } from './core/usePagination'

export const useAsyncData = createUseAsyncData()

export const useFetch = createUseFetch()
export const usePagination = createUsePagination()

// types
export type * from './core/types'
