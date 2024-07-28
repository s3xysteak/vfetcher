import type { $Fetch, FetchOptions, MappedResponseType } from 'ofetch'
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

export interface UseFetchOptions<R extends ResponseType = ResponseType> extends UseFetchReactiveOptions, Omit<FetchOptions<R>, keyof UseFetchReactiveOptions> {
  /** If make a request during initialization */
  immediate?: boolean

  /** Same as Vue's `watch`. Refresh when watch source updated */
  watch?: Arrayable<WatchSource> | false

  /** Indicate the interval time for polling in millisecond */
  pollingInterval?: MaybeRefOrGetter<number>

  /** Indicate the debounce delay time in millisecond */
  debounceInterval?: MaybeRefOrGetter<number>

  /** Indicate the throttle wait time in millisecond */
  throttleInterval?: MaybeRefOrGetter<number>
}

export interface UseFetchReturns<R extends ResponseType = ResponseType, T = any> {
  /** The data which `ofetch` returns */
  data: Ref<MappedResponseType<R, T> | null>

  /** A boolean value indicating whether the data is still being fetched */
  pending: Ref<boolean>

  /** A function used to manually trigger the request */
  refresh: () => Promise<void>

  /** A function used to manually trigger the request */
  execute: () => Promise<void>

  /** The error object if the data fetch fails, otherwise `null`. */
  error: Ref<Error | null>

  /**
   * A string representing the state of the data request.
   * @example
   * 'idle', 'pending', 'success', 'error'
   */
  status: Ref<UseFetchStatus>
}

export interface ResponseMap {
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

export interface UsePaginationOptions<R extends ResponseType = ResponseType> extends UseFetchOptions<R> {
  pageCurrentKey?: string
  pageSizeKey?: string
  defaultPageSize?: number
  totalKey?: string
  pageTotalKey?: string
  useFetch?: UseFetch
}

export interface UsePaginationReturns<R extends ResponseType = ResponseType, T = any> extends UseFetchReturns<R, T> {
  /** A number to indicate which page you are on */
  pageCurrent: Ref<number>
  /** A number to indicate the size of a page */
  pageSize: Ref<number>

  /** Readonly number to indicate how many items of the data */
  total: ComputedRef<number>
  /** Readonly number to indicate how many pages here */
  pageTotal: ComputedRef<number>
}
