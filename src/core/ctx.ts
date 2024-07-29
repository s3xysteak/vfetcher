import type { FetchContext } from 'ofetch'
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
    resolveBody,
  }
}

function resolveBody(content: FetchContext) {
  if (!content.options.body)
    return

  const contentType = getContentType(content.options.headers)
  if (!contentType)
    return

  if (!contentType.includes('application/x-www-form-urlencoded'))
    return

  if (!isJSONSerializable(content.options.body))
    return

  content.options.body = new URLSearchParams(content.options.body as any)
}

function getContentType(_headers: HeadersInit | undefined) {
  const headers = new Headers(_headers)
  return headers.get('Content-Type')
    ?? headers.get('content-type')
    ?? headers.get('Content-type')
    ?? headers.get('content-Type')
  // Actually I don't think it is necessary to check more cases
}

function isJSONSerializable(value: any) {
  if (value === undefined) {
    return false
  }
  const t = typeof value
  if (t === 'string' || t === 'number' || t === 'boolean' || t === null) {
    return true
  }
  if (t !== 'object') {
    return false // bigint, function, symbol, undefined
  }
  if (Array.isArray(value)) {
    return true
  }
  if (value.buffer) {
    return false
  }
  return (
    (value.constructor && value.constructor.name === 'Object')
    || typeof value.toJSON === 'function'
  )
}
