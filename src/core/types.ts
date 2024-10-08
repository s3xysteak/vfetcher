import type { FetchOptions, MappedResponseType } from 'ofetch'
import type { ComputedRef, MaybeRefOrGetter, Ref, WatchSource } from 'vue'

export type UseAsyncDataStatus = 'idle' | 'pending' | 'success' | 'error'

export interface ResponseMap {
  blob: Blob
  text: string
  arrayBuffer: ArrayBuffer
  stream: ReadableStream<Uint8Array>
}

export type ResponseType = keyof ResponseMap | 'json'

// * useAsyncData
export interface UseAsyncData {
  <T = any>(
    request: () => Promise<T>,
    options?: UseAsyncDataOptions,
  ): UseAsyncDataReturns<T>
  create: (options?: UseAsyncDataOptions) => UseAsyncData
}

export interface UseAsyncDataOptions {
  /** If make a request during initialization */
  immediate?: boolean

  /** Same as Vue's `watch`. Refresh when watch source updated */
  watch?: MultiWatchSource | MultiWatchSource[] | false

  /** Indicate the interval time for polling in millisecond */
  pollingInterval?: MaybeRefOrGetter<number>

  /** Indicate the debounce delay time in millisecond */
  debounceInterval?: MaybeRefOrGetter<number>

  /** Indicate the throttle wait time in millisecond */
  throttleInterval?: MaybeRefOrGetter<number>

  /** Only request if true. Request will be prevented if false. */
  ready?: MaybeRefOrGetter<boolean>
}

export interface UseAsyncDataReturns<Data> {
  /** The data which the async function returns */
  data: Ref<Data | null>

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
  status: Ref<UseAsyncDataStatus>
}

// * useFetch

export interface UseFetch {
  <T = any, R extends ResponseType = 'json'>(
    _req: UseFetchParams,
    options?: UseFetchOptions<R>,
  ): UseFetchReturns<R, T>
  create: (options?: UseFetchOptions) => UseFetch
}

export type UseFetchParams = MaybeRefOrGetter<string | Request>

export interface UseFetchReactiveOptions {
  method?: MaybeRefOrGetter<FetchOptions['method']>
  query?: MaybeRefOrGetter<FetchOptions['query']>
  params?: MaybeRefOrGetter<FetchOptions['params']>
  body?: MaybeRefOrGetter<FetchOptions['body']>
  headers?: MaybeRefOrGetter<FetchOptions['headers']>
  baseURL?: MaybeRefOrGetter<FetchOptions['baseURL']>
}

export type UseFetchOptions<R extends ResponseType = ResponseType> =
  & UseAsyncDataOptions
  & UseFetchReactiveOptions
  & Omit<FetchOptions<R>, keyof UseFetchReactiveOptions>

export type UseFetchReturns<R extends ResponseType = ResponseType, T = any> = UseAsyncDataReturns<MappedResponseType<R, T>>

// * UsePagination

export interface UsePagination {
  <T = any, R extends ResponseType = 'json'>(
    _req: UseFetchParams,
    options?: UsePaginationOptions<R>,
  ): UsePaginationReturns<R, T>
  create: (options?: UsePaginationOptions) => UsePagination
}

export interface UsePaginationOptions<R extends ResponseType = ResponseType> extends UseFetchOptions<R> {
  pageCurrentKey?: string
  pageSizeKey?: string
  defaultPageSize?: number
  totalKey?: string
  pageTotalKey?: string
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

export type MultiWatchSource = WatchSource<unknown> | object
