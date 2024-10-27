import type { ResponseType } from 'ofetch'
import type { UseFetchOptions } from './types'

export function createContext<R extends ResponseType>(options: UseFetchOptions<any, any, R>) {
  const {
    immediate = true,
    watch = [],
    pollingInterval,
    debounceInterval,
    throttleInterval,
    ready = true,
    transform = r => r,

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

    ...optionsWatch
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
    },
    optionsWatch,
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
