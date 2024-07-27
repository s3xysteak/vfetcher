import { expect, it } from 'vitest'
import { $fetch } from 'ofetch'
import { createUseFetch, useFetch } from '../src'
import { createTest, next, sleep } from '.'

createTest(3000, (listener, getURL) => {
  it('pre-try', async () => {
    expect(await $fetch(getURL('ok'))).toBe('ok')
    expect(await $fetch(getURL('params'), { query: { one: '1' } })).toEqual({ one: '1' })
    expect(await $fetch('ok', { baseURL: listener.value.url })).toBe('ok')

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
