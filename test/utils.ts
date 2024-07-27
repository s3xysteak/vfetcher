import type { Ref } from 'vue'
import { watch } from 'vue'

export function next<T>(source: Ref<T>): Promise<T> {
  return new Promise((resolve) => {
    const stop = watch(source, (val) => {
      stop()
      resolve(val)
    })
  })
}

export function sleep(t: number) {
  return new Promise<void>((res) => {
    setTimeout(res, t)
  })
}
