import type { FetchOptions, ResponseType } from 'ofetch'
import type { UseAsyncDataOptions, UseFetchOptions, UseFetchReactiveOptions } from './types'
import { clearUndefined } from './utils/general'

export interface Context<R extends ResponseType = any> {
  optionsComposable: Required<Omit<UseAsyncDataOptions<any, any>, 'pollingInterval' | 'debounceInterval' | 'throttleInterval'>>
    & {
      pollingInterval?: UseAsyncDataOptions<any, any>['pollingInterval']
      debounceInterval?: UseAsyncDataOptions<any, any>['debounceInterval']
      throttleInterval?: UseAsyncDataOptions<any, any>['throttleInterval']
    }
  optionsWatch: UseFetchReactiveOptions
  options$fetch: Omit<FetchOptions<R>, keyof UseFetchReactiveOptions>
}

export function createContext(options: UseAsyncDataOptions<any, any>): { optionsComposable: Context['optionsComposable'] }
export function createContext<R extends ResponseType>(options: UseFetchOptions<any, any, R>): Context<R>
export function createContext<R extends ResponseType>(options: UseFetchOptions<any, any, R>): Context<R> {
  const {
    /** composables options */
    immediate = true,
    watch = [],
    pollingInterval,
    debounceInterval,
    throttleInterval,
    ready = true,
    transform = r => r,

    /** watch options */
    agent,
    baseURL,
    body,
    dispatcher,
    headers,
    method,
    params,
    query,

    /** ofetch options */
    cache,
    credentials,
    duplex,
    ignoreResponseError,
    integrity,
    keepalive,
    mode,
    onRequest,
    onRequestError,
    onResponse,
    onResponseError,
    parseResponse,
    priority,
    redirect,
    referrer,
    referrerPolicy,
    responseType,
    retry,
    retryDelay,
    retryStatusCodes,
    signal,
    timeout,
    window,
  } = options

  return {
    optionsComposable: {
      immediate,
      watch,
      pollingInterval,
      debounceInterval,
      throttleInterval,
      ready,
      transform,
      default: options.default ?? (() => null),
    },
    optionsWatch: clearUndefined({
      agent,
      baseURL,
      body,
      dispatcher,
      headers,
      method,
      params,
      query,
    }),
    options$fetch: {
      cache,
      credentials,
      duplex,
      ignoreResponseError,
      integrity,
      keepalive,
      mode,
      onRequest,
      onRequestError,
      onResponse,
      onResponseError,
      parseResponse,
      priority,
      redirect,
      referrer,
      referrerPolicy,
      responseType,
      retry,
      retryDelay,
      retryStatusCodes,
      signal,
      timeout,
      window,
    },
  }
}
