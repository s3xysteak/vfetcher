import { afterAll, beforeAll, describe } from 'vitest'
import { getQuery, joinURL } from 'ufo'
import {
  createApp,
  eventHandler,
  readBody,
  toNodeListener,
} from 'h3'
import { type Listener, listen } from 'listhen'
import type { ShallowRef } from 'vue'
import { shallowRef } from 'vue'

export * from './utils'

type CreateTestCallback = (
  listener: ShallowRef<Awaited<ReturnType<typeof listen>>>,
  getURL: (url: string) => string
) => void

export function createTest(port: number, fn: CreateTestCallback) {
  describe.concurrent('vfetcher', () => {
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
  })
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
      '/binary',
      eventHandler((event) => {
        event.node.res.setHeader('Content-Type', 'application/octet-stream')
        return new Blob(['binary'])
      }),
    )
}
