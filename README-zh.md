# vfetcher

[English](/README.md) | 简体中文

用于数据请求的Vue组合式函数, 基于 [unjs/ofetch](https://github.com/unjs/ofetch)。

```sh
$ pnpm i vfetcher
```

## 特性

- 精心设计的API: 刻意模仿 [nuxt/useFetch](https://nuxt.com.cn/docs/api/composables/use-fetch) 的api，以尽可能保持一致性，减少迁移负担。
- 更多功能: 开箱即用的 节流/防抖/轮询/分页...以及将来更多功能！

## 使用

> 访问 [examples](/examples/src/) 以查看配置示例，访问 [test](/test/) 以查看使用示例。

### 重导出 ofetch

`vfetcher` 重导出了 `ofetch` 的全部导出，以方便直接使用ofetch：

```ts
import { $fetch } from 'vfetcher/ofetch'
```

### 基本示例

useAsyncData第一个参数为回调函数，第二个参数为其配置项。默认情况下会在初始化时自动调用回调：

```ts
import { useAsyncData } from 'vfetcher'

const { data } = useAsyncData(() => $fetch('/return-ok'))
watchEffect(() => {
  console.log(data.value) // Ref
  // -> null
  // -> 'ok'
})
```

通过 `immediate: false` 选项避免在初始化时自动发出请求：

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

`watch` 选项接受与 Vue 的 `watch` 第一个参数相同的值。在这些响应式变量发生改变时，将会自动发出请求：

```ts
const dep = ref('foo')
useAsyncData(() => $fetch('ok'), {
  watch: [dep]
})
// request to => 'ok'
dep.value = 'bar'
// request to => 'ok'
```

`ready` 选项接受响应式布尔值，或是返回布尔值的函数。只有在结果为true时发出请求，结果为false时立即结束execute且不发出请求。这在使用依赖请求、又对请求条件有要求时很有用：

```ts
const ready = ref(false)
const { execute } = useAsyncData(() => $fetch('ok'), {
  immediate: false,
  ready
})
await execute()
// the promise will be resolved immediately and no request will be send
ready.value = true
await execute()
// request to => 'ok'
```

useAsyncData的返回值 `status` 表示了当前状态，通过对status的监听，你可以实现在不同情况下的回调。status 在最初总是`idle`表示空闲，在请求发出前变为`pending`表示等待响应，请求成功后变为`success`表示成功，或者在失败时变为`error`表示请求失败：

```ts
const { status } = useAsyncData(() => $fetch('ok'))

// Equal to `onSuccess` hook:
watch(status, (v) => {
  if (v !== 'success')
    return

  onSuccess()
})
```

通过 `pollingInterval` 选项以进行轮询请求：

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

通过 `debounceInterval` 选项以进行防抖：

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

通过 `throttleInterval` 选项以进行节流：

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

### 自定义默认参数

你可以自定义 `useAsyncData` 以设置你最喜欢的默认选项：

```ts
import { useAsyncData as $ } from 'vfetcher'

export const useAsyncData = $.create({
  immediate: false
})

const { execute } = useAsyncData(() => $fetch('ok'))
// ...
await execute()
```

新的 `useAsyncData` 会继承前一个的默认选项：

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

### 返回值

除了 `execute/refresh` 以外，其他变量都由`ref`包装：

- `data`: 异步请求返回的结果，默认为 `null`，结果为 `ofetch` 返回值。
- `pending`: 一个布尔值，指示数据是否仍在获取中。
- `error`: 如果数据获取失败，则为错误对象，否则为 `null`。
- `status`: 表示数据请求的状态的字符串 `(idle、pending、success、error)`
- `execute/refresh`: 用于手动调用请求的**函数**。

### 选项

- `immediate`: 一个布尔值，指示是否要在初始化时发出请求。默认为true。
- `watch`: 监听一组响应式源，与 Vue `watch`方法的第一个参数类型相同。在响应源发生变化时，将会重新发出请求。默认情况下会监听请求URL和请求参数（详见下文），你也可以手动将其设置为false以关闭该功能。
- `pollingInterval`: 可以是响应式值。传入一个`number`，单位为毫秒，用于指示轮询的间隔时间。默认不进行轮询。
- `debounceInterval`: 可以是响应式值。传入一个`number`，单位为毫秒，用于指示防抖的延迟时间。默认不进行防抖。
- `throttleInterval`: 可以是响应式值。传入一个`number`，单位为毫秒，用于指示节流的等待时间。默认不进行节流。

## useFetch

useFetch几乎是useAsyncData与ofetch的结合：

- 第一个参数与ofetch第一个参数基本相同。
- 第二个参数同时接受useAsyncData和ofetch的全部配置项。
- 返回值与useAsyncData相同。

得益于ofetch，数据会被自动转换为合适的类型：

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

请求路径、请求头、请求query、请求体等一系列请求参数可以传入响应式值，这会在其改变时自动发出请求：

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

与useAsyncData相同，你也可以配置你喜欢的默认参数，详见上文：

```js
import { useFetch as $ } from 'vfetcher'

export const useFetch = $.create({
  // ...
})
```

useFetch拥有与useAsyncData相同的返回值及其全部选项。他还接受ofetch的全部选项，其中默认情况下会监听ofetch的以下参数：

- `URL`: 请求的路径URL。
- `method`: 请求的方法类型。
- `query`: 查询参数。
- `params`: 只是`query`的别名。
- `body`: 请求体。
- `headers`: 请求头。
- `baseURL`: 请求的基础路径。

> ... 其他 `ofetch` 的一般选项，请查阅 [ofetch 官方文档](https://github.com/unjs/ofetch) 。

## 分页

使用 `usePagination` 方法处理分页。

`import { usePagination } from 'vfetcher'`

### 基本使用

usePagination是基于useFetch封装的：

- 第一个参数与usePagination相同。
- 第二个参数是配置项，拥有useFetch的全部配置。
- 返回值中，拥有useFetch的全部返回值。

你可以直接使用useFetch的配置项：

```ts
usePagination('ok', {
  immediate: false
})
```

它自动的将分页参数合并到query内：

```ts
usePagination('getByPage')
// request to => `/getByPage?current=1&pageSize=10`
```

相比于`useFetch`新增了一些返回值，他们同样是响应式的：

```ts
const { pageCurrent } = usePagination('getByPage')
// request to => `/getByPage?current=1&pageSize=10`
pageCurrent.value = 2
// request to => `/getByPage?current=2&pageSize=10`
```

通过 `lodash - get` 获取分页大小与数据总数，你也可以手动进行配置：

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

与useFetch相同，你也可以配置你喜欢的默认参数，详见上文：

```js
import { usePagination as $ } from 'vfetcher'

export const usePagination = $.create({
  // ...
})
```

### 新增的返回值与选项

usePagination拥有useFetch的全部选项和返回值，除此以外，还新增了一些其专属的选项与返回值。

所有新增返回值都是响应式变量：

- `pageCurrent`: 表示当前页码的数字 (number)。
- `pageSize`: 表示单页数量的数字 (number)。
- `total`: 表示数据总数的只读数字 (read-only number)。
- `pageTotal`: 表示页码总数的只读数字 (read-only number)。

新增的选项：

- `pageCurrentKey`: 表示当前页码的键名，用于在query中传递。默认为`'current'`。
- `pageSizeKey`: 表示单页数量的键名，用于在query中传递。默认为`'pageSize'`。
- `defaultPageSize`: 表示默认单页数量的number，在`immediate: true`时很有用。 默认为`10`。
- `totalKey`: 获取数据总数的键名，通过`lodash - get`在返回数据中获取。默认为`'total'`。
- `pageTotalKey`: 获取页码总数的键名，通过`lodash - get`在返回数据中获取。默认为`'totalPage'`。
