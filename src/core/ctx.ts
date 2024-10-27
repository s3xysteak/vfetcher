import type { ResponseType } from 'ofetch'
import type { UseFetchOptions } from './types'
import { clearUndefined } from './utils/general'

export function createContext<R extends ResponseType>(options: UseFetchOptions<any, any, R>) {
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
