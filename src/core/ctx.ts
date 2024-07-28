import type { ResponseType, UseFetchOptions } from './types'

export function createContext<R extends ResponseType>(userOptions: UseFetchOptions<R>) {
  const options = resolveOptions<R>(userOptions)

  return {
    ...options,
  }
}

function resolveOptions<R extends ResponseType>(options: UseFetchOptions<R>) {
  const {
    immediate = true,
    watch = [],
    pollingInterval,
    debounceInterval,
    throttleInterval,

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
