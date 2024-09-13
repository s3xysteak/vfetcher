import { $fetch } from 'ofetch'
import { expect, it } from 'vitest'
import { effectScope, ref, watch } from 'vue'
import { createTest, next, sleep } from '.'
import { useAsyncData } from '../src'

createTest(3004, 'useAsyncData', (_, getURL) => {
  it('get', async () => {
    const { data } = useAsyncData(() => $fetch(getURL('ok')))
    expect(await next(data)).toBe('ok')
  })

  it('post', async () => {
    const { data } = useAsyncData(() => $fetch(getURL('post'), { method: 'post', body: { one: 1 } }))
    expect(await next(data)).toEqual({ one: 1 })
  })

  it('post-x-www-form', async () => {
    const { data } = useAsyncData(() => $fetch(getURL('post'), {
      method: 'post',
      body: new URLSearchParams({ one: '1' }),
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    }))

    expect(await next(data)).toEqual({ one: '1' })
  })

  it('ready', async () => {
    const ready = ref(false)
    const { data, execute } = useAsyncData(() => $fetch(getURL('ok')), {
      immediate: false,
      ready,
    })
    await execute()
    expect(data.value).toBeNull()

    ready.value = true
    await execute()
    expect(data.value).toBe('ok')
  })

  it('watch option', async () => {
    const times = ref(0)
    const source = ref(false)

    useAsyncData(() => $fetch(getURL('ok'), {
      onResponse: () => { times.value++ },
    }), {
      watch: [source],
      immediate: false,
    })

    source.value = true
    expect(await next(times)).toBe(1)
  })

  it('status', async () => {
    const { status, data } = useAsyncData(() => $fetch(getURL('ok')))

    const target = ref('')

    watch(status, (val) => {
      if (val !== 'success')
        return

      target.value = data.value
    })

    expect(await next(target)).toBe('ok')
  })

  it('polling', async () => {
    const times = ref(0)

    const scope = effectScope()

    scope.run(() => {
      useAsyncData(() => $fetch(getURL('ok'), {
        onResponse: () => { times.value++ },
      }), {
        pollingInterval: 50,
      })
    })

    expect(times.value).toBe(0)
    expect(await next(times)).toBe(1)
    await sleep(80)
    expect(times.value).toBe(2)
    scope.stop()

    await sleep(100)
    expect(times.value).toBe(2)
  })

  it('debounce', async () => {
    const times = ref(0)
    const { execute } = useAsyncData(() => $fetch(getURL('ok'), {
      onResponse() {
        times.value++
      },
    }), {
      debounceInterval: 50,
      immediate: false,
    })

    await execute()
    expect(times.value).toBe(1)
    execute()
    execute()
    execute()

    await sleep(100)
    await execute()

    expect(times.value).toBe(3)
  })

  it('throttle', async () => {
    const times = ref(0)
    const { execute } = useAsyncData(() => $fetch(getURL('ok'), {
      onResponse() {
        times.value++
      },
    }), {
      throttleInterval: 100,
      immediate: false,
    })

    await execute()
    expect(times.value).toBe(1)
    execute()
    execute()

    await sleep(150)
    await execute()

    expect(times.value).toBe(2)
  })

  it('useAsyncData.create', async () => {
    const $1 = useAsyncData.create({ immediate: false })
    const { data: d1, execute: e1 } = $1(() => $fetch(getURL('ok')))
    await e1()
    expect(d1.value).toBe('ok')

    const ready = ref(false)
    const $2 = $1.create({ ready })
    const { data: d2, execute: e2 } = $2(() => $fetch(getURL('ok')))
    await e2()
    expect(d2.value).toBe(null)

    ready.value = true
    await e2()
    expect(d2.value).toBe('ok')
  })

  it('test error', async () => {
    const { execute, error } = useAsyncData(() => $fetch(getURL('404')), {
      immediate: false,
    })

    await expect(() => execute()).rejects.toThrowError()
    expect(error.value?.message.includes('404')).toBeTruthy()
  })

  it('try catch', async () => {
    const { execute, error } = useAsyncData(() => $fetch(getURL('404')), {
      immediate: false,
    })

    try {
      await execute()
    }
    catch (e) {
      expect(error.value).toEqual(e)
    }
  })
})
