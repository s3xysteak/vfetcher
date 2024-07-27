import type { FetchOptions, MappedResponseType } from 'ofetch'
import type { ComputedRef, MaybeRefOrGetter, Ref, WatchSource } from 'vue'
import type { Arrayable } from './utils/types'

export type UseFetchStatus = 'idle' | 'pending' | 'success' | 'error'

export type UseFetchParams = MaybeRefOrGetter<string | Request>

export interface UseFetchReactiveOptions {
  method?: MaybeRefOrGetter<FetchOptions['method']>
  query?: MaybeRefOrGetter<FetchOptions['query']>
  params?: MaybeRefOrGetter<FetchOptions['params']>
  body?: MaybeRefOrGetter<FetchOptions['body']>
  headers?: MaybeRefOrGetter<FetchOptions['headers']>
  baseURL?: MaybeRefOrGetter<FetchOptions['baseURL']>
}

export interface UseFetch {
  <T = any, R extends ResponseType = ResponseType>(
    _req: UseFetchParams,
    options?: UseFetchOptions<R>,
  ): UseFetchReturns<R, T>
  create: <R extends ResponseType = ResponseType>(options?: UseFetchOptions<R>) => UseFetch
}

export interface UseFetchOptions<R extends ResponseType> extends UseFetchReactiveOptions, Omit<FetchOptions<R>, keyof UseFetchReactiveOptions> {
  immediate?: boolean
  watch?: Arrayable<WatchSource> | false
  pollingInterval?: MaybeRefOrGetter<number>
  debounceInterval?: MaybeRefOrGetter<number>
  throttleInterval?: MaybeRefOrGetter<number>
}

export interface UseFetchReturns<R extends ResponseType, T> {
  data: Ref<MappedResponseType<R, T> | null>
  pending: Ref<boolean>
  refresh: () => Promise<void>
  execute: () => Promise<void>
  error: Ref<Error | null>
  status: Ref<UseFetchStatus>
}

interface ResponseMap {
  blob: Blob
  text: string
  arrayBuffer: ArrayBuffer
  stream: ReadableStream<Uint8Array>
}

export type ResponseType = keyof ResponseMap | 'json'

export interface UsePagination {
  <T = any, R extends ResponseType = ResponseType>(
    _req: UseFetchParams,
    options?: UsePaginationOptions<R>,
  ): UsePaginationReturns<R, T>
  create: <R extends ResponseType = ResponseType>(options?: UsePaginationOptions<R>) => UsePagination
}

export interface UsePaginationOptions<R extends ResponseType> extends UseFetchOptions<R> {
  pageCurrentKey?: string
  pageSizeKey?: string
  defaultPageSize?: number
  totalKey?: string
  pageTotalKey?: string
  useFetch?: UseFetch
}

export interface UsePaginationReturns<R extends ResponseType, T> extends UseFetchReturns<R, T> {
  pageCurrent: Ref<number>
  pageSize: Ref<number>

  total: ComputedRef<number>
  pageTotal: ComputedRef<number>
}
