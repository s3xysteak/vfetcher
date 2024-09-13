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
