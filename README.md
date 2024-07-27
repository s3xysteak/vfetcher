# vfetcher

English | [简体中文](/README-zh.md)

Vue composables for fetching data, based on [unjs/ofetch](https://github.com/unjs/ofetch).

```sh
$ pnpm i vfetcher
```

## Features

- Carefully designed API: Intentionally mimicking the [nuxt/useFetch](https://nuxt.com.cn/docs/api/composables/use-fetch) API to maintain consistency as much as possible and reduce migration burden.
- More features: Throttling/debouncing/polling out of the box... and more features to come!

## Usage

### Basic example

By default, useFetch will automatically make a request during initialization:

```ts
import { useFetch } from 'vfetcher'

const { data } = useFetch('/return-ok')
watchEffect(() => {
  console.log(data.value) // Ref
  // -> null
  // -> 'ok'
})
```

Thanks to ofetch, data will be automatically converted to the appropriate type:

```ts
const { data } = useFetch('/return-json')
watchEffect(() => {
  console.log(data.value)
  // -> null
  // -> { one: 1 }
})
```

A series of request parameters, such as request path, request headers, request query, and request body, can accept reactive values, which will automatically trigger a request when they change:

```ts
const url = ref('return-ok')
const query = ref({ one: '1' })
const { data } = useFetch(url, { query })
watchEffect(() => {
  console.log(data.value)
})

// -> null
// -> 'ok'

url.value = 'return-query'

// -> { one: '1' }

query.value = { two: '2' }

// -> { two: '2' }
```

The second parameter accepts a series of configuration options, including all the configuration options of ofetch:

```ts
useFetch('/return-ok', {
  async onRequest(ctx) {
    ctx.options.headers ??= new Headers()
    const headers = ctx.options.headers
    if (headers instanceof Headers) {
      await sleep(10) // mock request
      headers.append('token', 'my-auth-token')
    }
  },
  onResponse(ctx) {
    console.log(ctx.response._data)
    // -> 'ok'
  }
})
```

### Customize the default options

You could customize `useFetch` to configure your favorite default options:

```ts
import { useFetch as $ } from 'vfetcher'

export const useFetch = $.create({
  baseURL: 'http://localhost:3000'
})

useFetch('ok')
// request to => 'http://localhost:3000/ok'
```

The new `useFetch` will extend the default options of the previous one:

```ts
import { useFetch as $1 } from 'vfetcher'

const $2 = $1.create({
  baseURL: 'http://localhost:3000'
})
const useFetch = $2.create({
  immediate: false
})

useFetch('ok')
// Equal to:
// `useFetch('ok', { baseURL: 'http://localhost:3000', immediate: false })`
```

### Manually control

Avoid making an automatic request during initialization by using the `immediate: false` option:

```ts
const { data, execute, refresh } = useFetch('return-ok', {
  immediate: false
})

watchEffect(() => {
  console.log(data.value)
})

// -> null

// await refresh() // as alias of execute
await execute()

// -> 'ok'
```

### Polling

Polling requests by using the `pollingInterval` option:

```ts
useFetch('ok', {
  pollingInterval: 2000 // 2 seconds
})

// request to => 'ok'
// wait 2 seconds...
// request to => 'ok'
```

### Debounce

Debounce by using the `debounceInterval` option:

```ts
const { execute } = useFetch('ok', {
  pollingInterval: 2000 // 2 seconds
})

await execute()
// request to => 'ok'
execute()
execute()

// after about 2 seconds
// request to => 'ok'
```

### Throttle

Throttle by using the `throttleInterval` option:

```ts
const { execute } = useFetch('ok', {
  throttleInterval: 2000 // 2 seconds
})

await execute()
// request to => 'ok'
execute()
execute()

// after about 2 seconds
await execute()
// request to => 'ok'
```

### Dependency refresh

The `watch` option receive the same variables as the first parameter of Vue's `watch`. It will automatically request when these variables changed.

```ts
const dep = ref('foo')
useFetch('ok', {
  watch: [dep]
})
// request to => 'ok'
dep.value = 'bar'
// request to => 'ok'
```

## Returns and options

### Returns

Except for `execute/refresh`, all other variables are wrapped by ref.

Here is the translation:

- `data`: The result returned by the asynchronous request, defaulting to `null`, with the result being the return value of `ofetch`.
- `pending`: A boolean value indicating whether the data is still being fetched.
- `error`: The error object if the data fetch fails, otherwise `null`.
- `status`: A string representing the state of the data request (`idle`, `pending`, `success`, `error`).
- `execute/refresh`: A **function** used to manually trigger the request.

### Options

- `immediate`: A boolean value indicating whether to make a request during initialization. Defaults to true.
- `watch`: Watches a set of reactive sources, similar to the first parameter type of the Vue `watch` method. When the reactive sources change, a new request will be made. By default, it watches the request URL and request parameters (detailed below), but you can manually set it to false to disable this feature.
- `pollingInterval`: Can be a reactive value. Pass a `number`, in milliseconds, to indicate the interval time for polling. By default, polling is not enabled.
- `debounceInterval`: Can be a reactive value. Pass a `number`, in milliseconds, to indicate the debounce delay time. By default, debounce is not enabled.
- `throttleInterval`: Can be a reactive value. Pass a `number`, in milliseconds, to indicate the throttle wait time. By default, throttling is not enabled.

For parameters that are watched by default:

- `URL`: The request path URL.
- `method`: The request method type.
- `query`: Query parameters, e.g., `useFetch('/abc', { query: { foo: 'bar' }})` will make a request to `'/abc?foo=bar'`.
- `params`: Just an alias for `query`.
- `body`: The request body.
- `headers`: The request headers.
- `baseURL`: The base path, e.g., `useFetch('/foo', { baseURL: 'http://a/b/c' })` will make a request to `'http://a/b/c/foo'`.

---

> ... it also accepts other general `ofetch` options. Please refer to the [ofetch official documentation](https://github.com/unjs/ofetch).
