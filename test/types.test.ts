import { expect, expectTypeOf, it } from 'vitest'
import { useFetch as $fetch, usePagination as $pagination, usePagination } from '../src'
import { createTest } from '.'

createTest(3003, (_, getURL) => {
  const useFetch = $fetch.create({ immediate: false })

  it('useFetch', async () => {
    const { data, execute } = useFetch<{ one: string }, 'json'>(getURL('query'), { query: { one: '1' } })
    await execute()
    expectTypeOf(data.value).toMatchTypeOf<{ one: string } | null>()
    expect(data.value).toEqual({ one: '1' })
  })

  it('usePagination', async () => {
    type PaginationData = { data: { id: number, name: string }[] } & Record<'current' | 'total' | 'pageSize', number>
    const { data, execute } = usePagination<PaginationData, 'json'>(getURL('getByPage'))

    await execute()

    expectTypeOf(data.value).toMatchTypeOf<PaginationData | null>()
    expect(data.value).toEqual({
      current: 1,
      total: 100,
      pageSize: 10,
      data: Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `data-${i + 1}` })),
    })
  })
})
