import type { Arrayable, Nullable } from './types'

export function noop() {}

/**
 * Convert `Arrayable<T>` to `Array<T>`
 *
 * @category Array
 */
export function toArray<T>(array?: Nullable<Arrayable<T>>): Array<T> {
  array = array ?? []
  return Array.isArray(array) ? array : [array]
}

/**
 * Dynamically get a nested value from an array or
 * object with a string.
 *
 * @example get(person, 'friends[0].name')
 */
export function get<TDefault = unknown>(value: any, path: string, defaultValue?: TDefault): TDefault {
  const segments = path.split(/[.[\]]/g)
  let current: any = value
  for (const key of segments) {
    if (current === null)
      return defaultValue as TDefault
    if (current === undefined)
      return defaultValue as TDefault
    const deQuoted = key.replace(/['"]/g, '')
    if (deQuoted.trim() === '')
      continue
    current = current[deQuoted]
  }
  if (current === undefined)
    return defaultValue as TDefault
  return current
}

/** Clear undefined fields from an object. It mutates the object */
export function clearUndefined<T extends object>(obj: T): T {
  // @ts-expect-error object
  Object.keys(obj).forEach((key: string) => (obj[key] === undefined ? delete obj[key] : {}))
  return obj
}
