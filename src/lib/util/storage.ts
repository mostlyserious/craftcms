import * as z from 'zod/mini'
import type { infer as Infer, ZodMiniType } from 'zod/mini'

type StorageGetter<T> = () => T | null
type StorageSetter<T> = (value: T) => T
type CookieSetter<T> = (value: T, expires?: number) => T

export function useLocal<T extends ZodMiniType>(
    key: string,
    schema: T,
): [StorageGetter<Infer<T>>, StorageSetter<Infer<T>>] {
    return [
        () => {
            try {
                return z.nullable(schema).parse(safeParse(localStorage.getItem(key)))
            } catch (_) {
                return null
            }
        },
        value => {
            const data = schema.parse(value)

            localStorage.setItem(key, JSON.stringify(data))

            return data
        },
    ]
}

export function useSession<T extends ZodMiniType>(
    key: string,
    schema: T,
): [StorageGetter<Infer<T>>, StorageSetter<Infer<T>>] {
    return [
        () => {
            try {
                return z.nullable(schema).parse(safeParse(sessionStorage.getItem(key)))
            } catch (_) {
                return null
            }
        },
        value => {
            const data = schema.parse(value)

            sessionStorage.setItem(key, JSON.stringify(data))

            return data
        },
    ]
}

export function useCookie<T extends ZodMiniType>(
    key: string,
    schema: T,
    defaultExpires = 3.154e7,
): [StorageGetter<Infer<T>>, CookieSetter<Infer<T>>] {
    return [
        () => {
            try {
                const cookieValue = `; ${document.cookie}`
                const parts = cookieValue.split(`; ${key}=`)

                if (parts.length === 2) {
                    const rawValue = parts[1].split(';').shift() ?? ''

                    return z.nullable(schema).parse(safeParse(decodeURIComponent(rawValue)))
                }

                return null
            } catch (_) {
                return null
            }
        },
        (value, expires = defaultExpires) => {
            const data = schema.parse(value)
            const encodedValue = encodeURIComponent(JSON.stringify(data))

            document.cookie = `${key}=${encodedValue};expires=${expiration(expires).toUTCString()};path=/;secure`

            return data
        },
    ]
}

function expiration(expires: number): Date {
    const now = new Date()

    now.setTime(now.getTime() + expires)

    return now
}

function safeParse(value: string | null): unknown {
    try {
        return JSON.parse(value || '')
    } catch (_) {
        return null
    }
}
