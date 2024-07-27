# vfetcher

[English](/README.md) | 简体中文

用于数据请求的Vue组合式函数, 基于 [unjs/ofetch](https://github.com/unjs/ofetch)。

```sh
$ pnpm i vfetcher
```

## 特性

- 精心设计的API: 刻意模仿 [nuxt/useFetch](https://nuxt.com.cn/docs/api/composables/use-fetch) 的api，以尽可能保持一致性，减少迁移负担。
- 更多功能: 开箱即用的 节流/防抖/轮询...以及将来更多功能！

## 使用

### 基本示例

useFetch默认情况下会在初始化时自动发出请求：

```ts
import { useFetch } from 'vfetcher'

const { data } = useFetch('/return-ok')
watchEffect(() => {
  console.log(data.value) // Ref
  // -> null
  // -> 'ok'
})
```

得益于ofetch，数据会被自动转换为合适的类型：

```ts
const { data } = useFetch('/return-json')
watchEffect(() => {
  console.log(data.value)
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

第二个参数接受一系列配置项，包括了ofetch配置项的全部配置项在内：

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

### 自定义默认参数

你可以自定义 `useFetch` 以设置你最喜欢的默认选项：

```ts
import { createUseFetch } from 'vfetcher'

export const useFetch = createUseFetch({
  baseURL: 'http://localhost:3000'
})

useFetch('ok')
// request to => 'http://localhost:3000/ok'
```

### 手动控制

通过 `immediate: false` 选项避免在初始化时自动发出请求：

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

### 轮询

通过 `pollingInterval` 选项以进行轮询请求：

```ts
useFetch('ok', {
  pollingInterval: 2000 // 2 seconds
})

// request to => 'ok'
// wait 2 seconds...
// request to => 'ok'
```

### 防抖

通过 `debounceInterval` 选项以进行防抖：

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

### 节流

通过 `throttleInterval` 选项以进行节流：

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

### 依赖刷新

`watch` 选项接受与 Vue 的 `watch` 第一个参数相同的值。在这些响应式变量发生改变时，将会自动发出请求：

```ts
const dep = ref('foo')
useFetch('ok', {
  watch: [dep]
})
// request to => 'ok'
dep.value = 'bar'
// request to => 'ok'
```

## 返回值与选项

### 返回值

除了 `execute/refresh` 以外，其他变量都由`ref`包装。

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

对于默认情况下进行监听的参数：

- `URL`: 请求的路径URL。
-  `method`: 请求的方法类型。
-  `query`: 查询参数，如 `useFetch('/abc', { query: { foo: 'bar' }})` 将会向 `'/abc?foo=bar'` 发出请求。
-  `params`: 只是`query`的别名。
-  `body`: 请求体。
-  `headers`: 请求头。
-  `baseURL`: 基础路径，如 `useFetch('/foo', { baseURL: 'http://a/b/c' })` 将会向 `'http://a/b/c/foo'` 发出请求。

---

> ... 也可以接受其他 `ofetch` 的一般选项，请查阅 [ofetch 官方文档](https://github.com/unjs/ofetch) 。
