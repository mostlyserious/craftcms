/// <reference types="svelte" />
/// <reference types="vite/client" />

import * as z from 'zod/mini'

declare global {
    interface Window {
        $app: unknown
    }

    type ZodInfer<T> = z.infer<T>

    type Prettify<T> = { [K in keyof T]: T[K] } & {}

    type MethodOf<T> = {
        [P in keyof T]: T[P] extends () => unknown ? P : never
    }[keyof T]

    type Json<T> = string & {
        source: T
    }

    type JsonValue<T> = T extends string|number|null|boolean ? T
        : T extends { toJSON(): infer R } ? R
        : T extends undefined|((...args: Array<any>) => any) ? never
        : T extends object ? ParsedJson<T>
        : never

    type ParsedJson<T> = {
        [K in keyof T as [JsonValue<T[K]>] extends [never] ? never : K]: JsonValue<T[K]>
    }

    type Mutable<T> = {
        -readonly [K in keyof T]: T[K]
    }

    interface JSON {
        stringify<const T>(value: T, replacer?: null|undefined, space?: string|number): Json<T>
        parse<T>(text: Json<T>, reviver?: null|undefined): Mutable<ParsedJson<T>>
    }

    type StrictlyComparable = string | number | boolean | symbol | bigint | null | undefined

    interface PerformanceEntry {
        hadRecentInput?: boolean
    }
}

export {}
