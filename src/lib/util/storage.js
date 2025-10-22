import * as z from 'zod/mini'

/**
 * @import { ZodMiniType } from 'zod/mini'
 * */

/** Store or retrieve a value in the local storage.
 * @template {ZodMiniType} T
 * @param {string} key
 * @param {T} schema
 * @return {[ () => ?ZodInfer<T>, (value: ZodInfer<T>) => ZodInfer<T> ]}
 * */
export function useLocal(key, schema) {
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

/** Store or retrieve a value in the session storage.
 * @template {ZodMiniType} T
 * @param {string} key
 * @param {T} schema
 * @return {[ () => ?ZodInfer<T>, (value: ZodInfer<T>) => ZodInfer<T> ]}
 * */
export function useSession(key, schema) {
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

/** Store or retrieve a value in a cookie.
 * @template {ZodMiniType} T
 * @param {string} key
 * @param {T} schema
 * @param {number} [defaultExpires=3.154e+7] - Default expiration in milliseconds (default: 1 year)
 * @return {[ () => ?ZodInfer<T>, (value: ZodInfer<T>, expires?: number) => ZodInfer<T> ]}
 * */
export function useCookie(key, schema, defaultExpires = 3.154e+7) {
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

/** Sets the expiration time for a cookie.
 * @param {number} expires - The duration for which the cookie should be valid in milliseconds.
 * @returns {Date} The exact expiry date and time of the cookie.
 * */
function expiration(expires) {
    const now = new Date()

    now.setTime(now.getTime() + expires)

    return now
}

/**
 * @param {any} value
 * */
function safeParse(value) {
    try {
        return JSON.parse(value || '')
    } catch (_) {
        return null
    }
}
