import { computed, effectScope, ref, watchEffect } from 'vue'
import { expect, it } from 'vitest'
import { getQuery } from 'ufo'
import { useFetch, usePagination } from '../src'
import { createTest, next, sleep } from '.'

createTest(3002, (listener, getURL) => {
  it('basic', async () => {
    const { data } = usePagination(getURL('ok'))
    expect(await next(data)).toBe('ok')
  })

  it('returns', async () => {
    const { data, pageCurrent, total, pageSize } = usePagination(getURL('getByPage'))
    expect(await next(data)).toEqual({
      total: 100,
      pageSize: 10,
      current: 1,
      data: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `data-${i + 1}`,
      })),
    })
    expect(pageSize.value).toBe(10)
    expect(total.value).toBe(100)

    pageSize.value = 20
    expect(await next(data)).toEqual({
      total: 100,
      pageSize: 20,
      current: 1,
      data: Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        name: `data-${i + 1}`,
      })),
    })

    pageCurrent.value = 2

    expect(await next(data)).toEqual({
      total: 100,
      pageSize: 20,
      current: 2,
      data: Array.from({ length: 20 }, (_, i) => ({
        id: i + 21,
        name: `data-${i + 21}`,
      })),
    })
  })

  it('override params', async () => {
    let key: string
    const { data, pageCurrent } = usePagination(getURL('getByPage'), {
      pageCurrentKey: 'pageCurrent',
      onResponse(ctx) {
        key = getQuery(ctx.request as string)?.pageCurrent as string
      },
    })
    await next(data)
    expect(key!).toBe('1')
    pageCurrent.value = 2
    await next(data)
    expect(key!).toBe('2')
  })

  it('usePagination.create', async () => {
    const $fetch = useFetch.create({ baseURL: listener.value.url })
    const $ = usePagination.create({
      pageCurrentKey: 'pageCurrent',
      useFetch: $fetch,
    })

    let key: string
    const { data, pageCurrent } = $('getByPage', {
      pageCurrentKey: 'pageCurrent',
      onResponse(ctx) {
        key = getQuery(ctx.request as string)?.pageCurrent as string
      },
    })
    await next(data)
    expect(key!).toBe('1')
    pageCurrent.value = 2
    await next(data)
    expect(key!).toBe('2')
  })
})
