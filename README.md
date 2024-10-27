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

> Visit [examples](/examples/src/) to see the config examples, visit [test](/test/) to see the usage examples.

### Re-export ofetch

`vfetcher` re-export all exports of `ofetch` so you can directly use ofetch：

```ts
import { $fetch } from 'vfetcher/ofetch'
```

### Basic Examples

The first parameter of `useAsyncData` is a callback function, and the second parameter is its configuration object. By default, the callback is automatically called during initialization:

```ts
import { useAsyncData } from 'vfetcher'

const { data } = useAsyncData(() => $fetch('/return-ok'))
watchEffect(() => {
  console.log(data.value) // Ref
  // -> null
  // -> 'ok'
})
```

Use the `immediate: false` option to prevent the request from being sent automatically during initialization:

```ts
const { data, execute, refresh } = useAsyncData(() => $fetch('return-ok'), {
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

The `watch` option accepts the same values as the first parameter of Vue's `watch`. When these reactive variables change, a request will be automatically sent:

```ts
const dep = ref('foo')
useAsyncData(() => $fetch('ok'), {
  watch: [dep]
})
// request to => 'ok'
dep.value = 'bar'
// request to => 'ok'
```

The `ready` option accepts a reactive boolean value or a function that returns a boolean. A request is only sent when the result is true; if the result is false, the `execute` is terminated immediately, and no request is sent. This is useful when using dependent requests with specific conditions:

```ts
const ready = ref(false)
const { execute } = useAsyncData(() => $fetch('ok'), {
  immediate: false,
  ready
})
await execute()
// the promise will be resolved immediately and no request will be sent
ready.value = true
await execute()
// request to => 'ok'
```

The `status` return value of `useAsyncData` indicates the current state. By monitoring the `status`, you can implement callbacks in different situations. The `status` is initially `idle`, indicating an idle state; it changes to `pending` before the request is sent, indicating a waiting response. Upon successful request, it changes to `success`, indicating success, or to `error` if the request fails:

```ts
const { status } = useAsyncData(() => $fetch('ok'))

// Equivalent to `onSuccess` hook:
watch(status, (v) => {
  if (v !== 'success')
    return

  onSuccess()
})
```

通过 `transform` 选项对返回值进行预处理:

```ts
const { data } = useAsyncData(() => $fetch('post', {
  method: 'post',
  body: {
    number: {
      one: 1
    }
  }
}), {
  transform: (res: { number: { one: 1 } }) => res.number.one
})

// request to => 'post'
// response `{ number: { one: 1 } }`
data.value === 1 // true
```

Use the `pollingInterval` option to perform polling requests:

```ts
useAsyncData(() => $fetch('ok'), {
  pollingInterval: 2000 // 2 seconds
})

// request to => 'ok'
// wait 2 seconds...
// request to => 'ok'

const { execute } = useAsyncData(() => $fetch('ok'), {
  pollingInterval: 2000, // 2 seconds
  immediate: false
})

// ...
// Will not poll until `execute` is called for the first time.

await execute() // request to => 'ok'
// wait 2 seconds...
// request to => 'ok'
```

Use the `debounceInterval` option to apply debouncing:

```ts
const { execute } = useAsyncData(() => $fetch('ok'), {
  debounceInterval: 2000 // 2 seconds
})

await execute()
// request to => 'ok'
execute()
execute()

// after about 2 seconds
// request to => 'ok'
```

Use the `throttleInterval` option to apply throttling:

```ts
const { execute } = useAsyncData(() => $fetch('ok'), {
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

### Customize the default options

You could customize `useAsyncData` to configure your favorite default options:

```ts
import { useAsyncData as $ } from 'vfetcher'

export const useAsyncData = $.create({
  immediate: false
})

const { execute } = useAsyncData(() => $fetch('ok'))
// ...
await execute()
```

The new `useAsyncData` will extend the default options of the previous one:

```ts
import { useAsyncData as $1 } from 'vfetcher'

const $2 = $1.create({
  debounceInternal: 150
})
const useAsyncData = $2.create({
  immediate: false
})

useAsyncData(() => $fetch('ok'))
// Equal to:
// `useAsyncData(() => $fetch('ok'), { debounceInternal: 150, immediate: false })`
```

### Returns

Except for `execute/refresh`, all other variables are wrapped by ref:

- `data`: The result returned by the asynchronous request, defaulting to `null`, with the result being the return value of `ofetch`.
- `pending`: A boolean value indicating whether the data is still being fetched.
- `error`: The error object if the data fetch fails, otherwise `null`.
- `status`: A string representing the state of the data request (`idle`, `pending`, `success`, `error`).
- `execute/refresh`: A **function** used to manually trigger the request.

### Options

- `immediate`: A boolean value indicating whether to make a request during initialization. Defaults to true.
- `watch`: Watches a set of reactive sources, similar to the first parameter type of the Vue `watch` method. When the reactive sources change, a new request will be made. By default, it watches the request URL and request parameters (detailed below), but you can manually set it to false to disable this feature.
- `transform`: A function that can be used to alter handler function result after resolving..
- `pollingInterval`: Can be a reactive value. Pass a `number`, in milliseconds, to indicate the interval time for polling. By default, polling is not enabled.
- `debounceInterval`: Can be a reactive value. Pass a `number`, in milliseconds, to indicate the debounce delay time. By default, debounce is not enabled.
- `throttleInterval`: Can be a reactive value. Pass a `number`, in milliseconds, to indicate the throttle wait time. By default, throttling is not enabled.

## useFetch

`useFetch` is almost a combination of `useAsyncData` and `ofetch`:

- The first parameter is basically the same as the first parameter of `ofetch`.
- The second parameter accepts all configuration options of both `useAsyncData` and `ofetch`.
- The return value is the same as that of `useAsyncData`.

Thanks to `ofetch`, the data will be automatically converted to the appropriate type:

```ts
const { data: d1 } = useFetch('/return-ok')
watchEffect(() => {
  console.log(d1.value)
  // -> null
  // -> 'ok'
})

const { data: d2 } = useFetch('/return-json')
watchEffect(() => {
  console.log(d2.value)
  // -> null
  // -> { one: 1 }
})
```

Request parameters such as the request path, headers, query, body, etc., can be passed in as reactive values, which will automatically trigger requests when they change:

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

Similar to `useAsyncData`, you can configure your preferred default parameters, as mentioned above:

```js
import { useFetch as $ } from 'vfetcher'

export const useFetch = $.create({
  // ...
})
```

`useFetch` shares the same return values and options as `useAsyncData`. It also accepts all options from `ofetch`, and by default, it monitors the following parameters from `ofetch`:

- `URL`: The request path URL.
- `method`: The request method type.
- `query`: Query parameters.
- `params`: Just an alias for `query`.
- `body`: The request body.
- `headers`: Request headers.
- `baseURL`: The base URL for the request.

> ... For other general options of `ofetch`, please refer to the [ofetch official documentation](https://github.com/unjs/ofetch).

## Pagination

Use `usePagination` function to handle pagination.

`import { usePagination } from 'vfetcher'`

### Basic usage

`usePagination` is a wrapper around `useFetch`:

- The first parameter is the same as in `usePagination`.
- The second parameter is a configuration object, containing all the configurations of `useFetch`.
- The return value includes all the return values of `useFetch`.

You can directly use the configuration options of `useFetch`.

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

Same as useFetch, you can also configure the default params you like. See above for details:

```js
import { usePagination as $ } from 'vfetcher'

export const usePagination = $.create({
  // ...
})
```

### New Return Values and Options

`usePagination` includes all the options and return values of `useFetch`. In addition, it also has some options and return values specific to itself.

All new return values are reactive variables:

- `pageCurrent`: Indicates the current page number (number).
- `pageSize`: Indicates the number of items per page (number).
- `total`: Indicates the total number of items (read-only number).
- `pageTotal`: Indicates the total number of pages (read-only number).

New Options

- `pageCurrentKey`: Indicates the key name for the current page number, used in the query. Default is `'current'`.
- `pageSizeKey`: Indicates the key name for the number of items per page, used in the query. Default is `'pageSize'`.
- `defaultPageSize`: Indicates the default number of items per page (number), useful when `immediate: true`. Default is `10`.
- `totalKey`: The key name for fetching the total number of items, obtained from the returned data using `lodash - get`. Default is `'total'`.
- `pageTotalKey`: The key name for fetching the total number of pages, obtained from the returned data using `lodash - get`. Default is `'totalPage'`.
