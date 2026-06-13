import { afterEach, describe, expect, test, vi } from 'vitest'
import { commit } from '$lib/util/query'

afterEach(() => {
    vi.restoreAllMocks()
})

describe('query commit', () => {
    test('skips duplicate history pushes for matching query strings', () => {
        history.replaceState(undefined, '', '/products?category=chairs')
        const pushState = vi.spyOn(history, 'pushState')

        commit({ category: 'chairs' })

        expect(pushState).not.toHaveBeenCalled()
    })

    test('skips duplicate history pushes when there is no query string', () => {
        history.replaceState(undefined, '', '/products')
        const pushState = vi.spyOn(history, 'pushState')

        commit({})

        expect(pushState).not.toHaveBeenCalled()
    })

    test('clears an existing query string once', () => {
        history.replaceState(undefined, '', '/products?category=chairs')
        const pushState = vi.spyOn(history, 'pushState')

        commit({ category: undefined })

        expect(pushState).toHaveBeenCalledOnce()
        expect(pushState).toHaveBeenCalledWith(undefined, '', '/products')
    })
})
