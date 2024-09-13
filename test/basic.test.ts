import { $fetch } from 'ofetch'
import { expect, it } from 'vitest'
import { createTest, next, sleep } from '.'
import { useFetch } from '../src'

createTest(3000, (listener, getURL) => {
  it('$fetch', async () => {
    expect(await $fetch(getURL('ok'))).toBe('ok')
    expect(await $fetch(getURL('params'), { query: { one: '1' } })).toEqual({ one: '1' })
    expect(await $fetch('ok', { baseURL: listener.value.url })).toBe('ok')
    expect(await $fetch(getURL('url/123'))).toBe('/123')
    expect(await $fetch(getURL('post'), {
      method: 'post',
      body: { one: 1 },
    })).toEqual({ one: 1 })
    expect(await $fetch(getURL('token'), {
      async onRequest(ctx) {
        ctx.options.headers ??= new Headers()
        const headers = ctx.options.headers
        if (headers instanceof Headers) {
          await sleep(10)
          headers.append('token', 'my-auth-token')
        }
      },
    })).toBe('my-auth-token')

    let testResponse = 'not Ok'
    await $fetch(getURL('ok'), {
      onResponse(ctx) {
        testResponse = ctx.response._data
      },
    })
    expect(testResponse).toBe('ok')
  })

  it('basic', async () => {
    const { data } = useFetch(getURL('ok'))
    expect(await next(data)).toBe('ok')
  })

  it('basic options', async () => {
    const { data } = useFetch('params', {
      baseURL: listener.value.url,
      query: { one: '1' },
    })
    expect(await next(data)).toEqual({ one: '1' })
  })
})
