# vfetcher

English | [简体中文](/README-zh.md)

Vue composables for fetching data, based on [unjs/ofetch](https://github.com/unjs/ofetch).

```sh
$ pnpm i vfetcher
```

## Features

- Carefully designed API: Intentionally mimicking the [nuxt/useFetch](https://nuxt.com.cn/docs/api/composables/use-fetch) API to maintain consistency as much as possible and reduce migration burden.
- More features: Throttling/debouncing/polling/pagination out of the box... and more features to come!

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
  // Interceptors
  async onRequest({ options }) {
    if (!(options.headers instanceof Headers))
      options.headers = new Headers(options.headers)

    await sleep(10) // mock request
    headers.append('token', 'my-auth-token')
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

### Hooks based on reactive variables

The `status` returned by useFetch shows the current status. By watching `status`, you can achieve callbacks for different statuses. `status` is always `idle` in the beginning to indicate idle, becomes `pending` before sending a request, becomes `success` after a successful request, or becomes `error` when the request fails.

```ts
const { status } = useFetch('ok')

// Equal to `onSuccess` hook:
watch(status, (v) => {
  if (v !== 'success')
    return

  onSuccess()
})
```

## Re-export ofetch

`vfetcher` re-export all exports of `ofetch` so you can directly use ofetch：

```ts
import { ofetch } from 'vfetcher/ofetch'
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

> ... It also accepts other general `ofetch` options. Please refer to the [ofetch official documentation](https://github.com/unjs/ofetch).

---

## Pagination

Use `usePagination` function to handle pagination.

`import { usePagination } from 'vfetcher'`

### Basic usage

`usePagination` extends all options of `useFetch`:

```ts
usePagination('ok', {
  immediate: false
})
```

It automatically merge the params of pagination to query:

```ts
usePagination('getByPage')
// request to => `/getByPage?current=1&pageSize=10`
```

Compared to `useFetch`, some new return values have been added, which are also responsive:

```ts
const { pageCurrent } = usePagination('getByPage')
// request to => `/getByPage?current=1&pageSize=10`
pageCurrent.value = 2
// request to => `/getByPage?current=2&pageSize=10`
```

Get pageSize and total data counts by `lodash - get` , or you can configure the param key manually:

```ts
const { data, total } = usePagination('getByPage', {
  totalKey: 'res.total'
})
watchEffect(() => {
  console.log(data.value)

  if (data.value)
    console.log(total.value)
})

// -> null
// -> { res: { total:10, data:[ /* ... */]} }
// -> 10
```

### New Return Values and Options

#### New Return Values

All new return values are reactive variables:

- `pageCurrent`: Indicates the current page number (number).
- `pageSize`: Indicates the number of items per page (number).
- `total`: Indicates the total number of items (read-only number).
- `pageTotal`: Indicates the total number of pages (read-only number).

#### New Options

- `pageCurrentKey`: Indicates the key name for the current page number, used in the query. Default is `'current'`.
- `pageSizeKey`: Indicates the key name for the number of items per page, used in the query. Default is `'pageSize'`.
- `defaultPageSize`: Indicates the default number of items per page (number), useful when `immediate: true`. Default is `10`.
- `totalKey`: The key name for fetching the total number of items, obtained from the returned data using `lodash - get`. Default is `'total'`.
- `pageTotalKey`: The key name for fetching the total number of pages, obtained from the returned data using `lodash - get`. Default is `'totalPage'`.
