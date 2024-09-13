import type { ShallowRef } from 'vue'
import {
  createApp,
  eventHandler,
  readBody,
  toNodeListener,
} from 'h3'
import { listen, type Listener } from 'listhen'
import { getQuery, joinURL } from 'ufo'
import { afterAll, beforeAll, describe } from 'vitest'
import { shallowRef } from 'vue'

export * from './utils'

type CreateTestCallback = (
  listener: ShallowRef<Awaited<ReturnType<typeof listen>>>,
  getURL: (url: string) => string
) => void

export function createTest(port: number, name: string, fn: CreateTestCallback, sync = false) {
  const run = () => {
    const listener = shallowRef<Listener>()
    const getURL = (url: string) => joinURL(listener.value!.url, url)

    beforeAll(async () => {
      const app = beforeAllCreateApp()
      listener.value = await listen(toNodeListener(app), { port })
    })

    afterAll(() => {
      listener.value!.close().catch(console.error)
    })

    fn(listener as ShallowRef<Listener>, getURL)
  }
  if (sync)
    describe(name, run)

  describe.concurrent(name, run)
}

function beforeAllCreateApp() {
  return createApp()
    .use(
      '/ok',
      eventHandler(() => 'ok'),
    )
    .use(
      '/params',
      eventHandler(event => getQuery(event.node.req.url || '')),
    )
    .use(
      '/query',
      eventHandler(event => getQuery(event.node.req.url || '')),
    )
    .use(
      '/url',
      eventHandler(event => event.node.req.url),
    )
    .use(
      '/token',
      eventHandler(event => event.node.req.headers.token),
    )
    .use(
      '/post',
      eventHandler(event => readBody(event)),
    )
    .use(
      '/getByPage',
      eventHandler((event) => {
        enum paginationKey {
          CURRENT = 'current',

          TOTAL_KEY = 'total',
          PAGE_SIZE_KEY = 'pageSize',
        }
        const data = Array.from({ length: 100 }, (_, i) => ({ id: i + 1, name: `data-${i + 1}` }))
        const query: Record<string, string> = getQuery(event.node.req.url || '')

        const currentPage = Number.parseInt(query[paginationKey.CURRENT]) || 1
        const pageSize = Number.parseInt(query[paginationKey.PAGE_SIZE_KEY]) || 10

        const totalItems = data.length
        const startIndex = (currentPage - 1) * pageSize
        const endIndex = Math.min(startIndex + pageSize, totalItems)
        const pageData = data.slice(startIndex, endIndex)

        return {
          [paginationKey.TOTAL_KEY]: totalItems,
          [paginationKey.PAGE_SIZE_KEY]: pageSize,
          [paginationKey.CURRENT ?? 'pageCurrent']: currentPage,
          data: pageData,
        }
      }),
    )
    .use(
      '/binary',
      eventHandler((event) => {
        event.node.res.setHeader('Content-Type', 'application/octet-stream')
        return new Blob(['binary'])
      }),
    )
}
