import { afterEach, describe, expect, test, vi } from 'vitest'
import * as z from 'zod/mini'
import { useCookie } from '$lib/util/storage'

afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
})

describe('cookie storage', () => {
    test('defaults cookie expiration to roughly one year in milliseconds', () => {
        const now = new Date('2026-01-01T00:00:00.000Z')

        vi.useFakeTimers()
        vi.setSystemTime(now)

        const cookieSetter = vi.spyOn(document, 'cookie', 'set')
        const [, setCookie] = useCookie('preference', z.string())

        setCookie('enabled')

        const cookie = cookieSetter.mock.calls[0]?.[0] ?? ''
        const expires = /expires=([^;]+)/.exec(cookie)?.[1]

        expect(expires).toBeDefined()
        expect(new Date(expires ?? '').getTime() - now.getTime()).toBe(3.154e10)
    })
})
