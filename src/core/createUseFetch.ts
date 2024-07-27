import type { ResponseType, UseFetchOptions, UseFetchParams } from './types'
import { useFetch } from './useFetch'

export function createUseFetch<R extends ResponseType = ResponseType>(options: UseFetchOptions<R> = {}) {
  return <T = any, R extends ResponseType = ResponseType>(
    _req: UseFetchParams,
    _options: UseFetchOptions<R> = {},
  ) => useFetch<T, R>(_req, Object.assign(options, _options))
}
