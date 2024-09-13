import { expectTypeOf, it } from 'vitest'
import { createTest } from '.'
import { useFetch as $fetch, usePagination } from '../src'

createTest(3003, 'types', (_, getURL) => {
  const useFetch = $fetch.create({ immediate: false })

  it('useFetch', async () => {
    const { data, execute } = useFetch<{ one: string }>(getURL('query'), { query: { one: '1' } })
    await execute()
    expectTypeOf(data.value).toMatchTypeOf<{ one: string } | null>()
  })

  it('usePagination', async () => {
    type PaginationData = { data: { id: number, name: string }[] } & Record<'current' | 'total' | 'pageSize', number>
    const { data, execute } = usePagination<PaginationData>(getURL('getByPage'))

    await execute()

    expectTypeOf(data.value).toMatchTypeOf<PaginationData | null>()
  })
}, true)
