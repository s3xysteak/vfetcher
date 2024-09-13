import { usePagination as $p, useFetch as $u } from 'vfetcher'
import { $fetch as $f, type FetchOptions } from 'vfetcher/ofetch'

export const $fetch = $f.create(options())
export const useFetch = $u.create(options())
export const usePagination = $p.create({
  ...options(),
  pageCurrentKey: 'pageNumber',
  pageSizeKey: 'pageSize',
  totalKey: 'res.total',
})

/** Using closures to avoid pollution */
function options(): FetchOptions {
  return {
    baseURL: 'http://localhost:3000',
    onRequest({ options }) {
      if (!(options.headers instanceof Headers))
        options.headers = new Headers(options.headers)

      options.headers.append('token', 'here is your token')

      if (options.method?.toLowerCase?.() === 'post' && options.body && isJSONSerializable(options.body)) {
        options.headers.append('Content-Type', 'application/x-www-form-urlencoded')
        options.body = new URLSearchParams(
          Object.fromEntries(
            Object.entries(options.body as Record<string, string>).filter(([_, v]) => v !== undefined && v !== null),
          ),
        )
      }
    },
    onResponse({ response }) {
      const router = useRouter()
      const message = useMessage()

      if (response.status >= 300 && response.status < 400)
        router.replace('/login')

      const msg = response._data?.msg
      if (msg)
        message.error(msg)
    },
  }
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

/** mock */
function useRouter() {
  return {
    replace(_: string) {},
  }
}

/** mock */
function useMessage() {
  return {
    error(_: string) {},
  }
}
