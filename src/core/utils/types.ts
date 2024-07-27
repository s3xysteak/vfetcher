/**
 * Void function
 */
export type Fn = () => void

/**
 * Any function
 */
export type AnyFn = (...args: any[]) => any

export type Promisify<T> = Promise<Awaited<T>>

export type ArgumentsType<T> = T extends (...args: infer U) => any ? U : never

export type PromisifyFn<T extends AnyFn> = (...args: ArgumentsType<T>) => Promisify<ReturnType<T>>

/**
 * Null or whatever
 */
export type Nullable<T> = T | null | undefined

/**
 * Array, or not yet
 */
export type Arrayable<T> = T | Array<T>
