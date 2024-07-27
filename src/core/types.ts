import type { FetchOptions, MappedResponseType } from 'ofetch'
import type { MaybeRefOrGetter, Ref, WatchSource } from 'vue'
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
