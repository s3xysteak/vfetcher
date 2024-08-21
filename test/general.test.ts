import { computed, effectScope, ref, watch } from 'vue'
import { expect, it } from 'vitest'
import { useFetch } from '../src'
import { defaultOptionsKey } from '../src/core/useFetch'
import { createTest, next, sleep } from '.'

createTest(3001, (listener, getURL) => {
  it('get', async () => {
    const { data } = useFetch(getURL('ok'))
    expect(await next(data)).toBe('ok')
  })

  it('post', async () => {
    const { data } = useFetch(getURL('post'), { method: 'post', body: { one: 1 } })
    expect(await next(data)).toEqual({ one: 1 })
  })

  it('post-x-www-form', async () => {
    const { data } = useFetch(getURL('post'), {
      method: 'post',
      body: new URLSearchParams({ one: '1' }),
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    })

    expect(await next(data)).toEqual({ one: '1' })
  })

  it('ready', async () => {
    const ready = ref(false)
    const { data, execute } = useFetch(getURL('ok'), {
      immediate: false,
      ready,
    })
    await execute()
    expect(data.value).toBeNull()

    ready.value = true
    await execute()
    expect(data.value).toBe('ok')
  })

  it('watch', async () => {
    const url = ref('ok')

    const { data } = useFetch(computed(() => getURL(url.value)))
    expect(await next(data)).toBe('ok')

    url.value = 'params?a=1'
    expect(await next(data)).toEqual({ a: '1' })
  })

  it('watch option', async () => {
    const times = ref(0)
    const source = ref(false)

    useFetch(getURL('ok'), {
      watch: [source],
      onResponse: () => { times.value++ },
      immediate: false,
    })

    source.value = true
    expect(await next(times)).toBe(1)
  })

  it('status', async () => {
    const { status, data } = useFetch(getURL('ok'))

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
      useFetch(getURL('ok'), {
        pollingInterval: 50,
        onResponse: () => { times.value++ },
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
    const { execute } = useFetch(getURL('ok'), {
      debounceInterval: 50,
      immediate: false,
      onResponse() {
        times.value++
      },
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
    const { execute } = useFetch(getURL('ok'), {
      throttleInterval: 100,
      immediate: false,
      onResponse() {
        times.value++
      },
    })

    await execute()
    expect(times.value).toBe(1)
    execute()
    execute()

    await sleep(150)
    await execute()

    expect(times.value).toBe(2)
  })

  it('useFetch.create', async () => {
    const $1 = useFetch.create({ immediate: false })
    const { data: d1, execute: e1 } = $1(getURL('ok'))
    await e1()
    expect(d1.value).toBe('ok')

    const $2 = $1.create({ baseURL: listener.value.url })
    const { data: d2, execute: e2 } = $2('ok')
    await e2()
    expect(d2.value).toBe('ok')

    expect($2[defaultOptionsKey]).toEqual({
      immediate: false,
      baseURL: listener.value.url,
    })
  })

  it('customize ofetch', async () => {
    const u = useFetch.create({
      immediate: false,
      onRequest({ options }) {
        options.query = { one: '1' }
      },
    })
    const { data, execute } = u(getURL('query'))
    await execute()

    expect(data.value).toEqual({ one: '1' })
  })

  it('test error', async () => {
    const { execute, error } = useFetch(getURL('404'), {
      immediate: false,
    })

    await expect(() => execute()).rejects.toThrowError()
    expect(error.value?.message.includes('404')).toBeTruthy()
  })

  it('try catch', async () => {
    const { execute, error } = useFetch(getURL('404'), {
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
