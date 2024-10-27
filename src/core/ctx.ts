import type { ResponseType } from 'ofetch'
import type { UseFetchOptions } from './types'

export function createContext<R extends ResponseType = ResponseType>(userOptions: UseFetchOptions<R>) {
  return resolveOptions<R>({ ...userOptions })
}

function resolveOptions<R extends ResponseType>(options: UseFetchOptions<R>) {
  const {
    immediate = true,
    watch = [],
    pollingInterval,
    debounceInterval,
    throttleInterval,
    ready = true,

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
