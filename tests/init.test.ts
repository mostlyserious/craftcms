import { afterEach, describe, expect, test, vi } from 'vitest'
import init from '$lib/init'

async function flush() {
    await vi.dynamicImportSettled()
    await new Promise(resolve => setTimeout(resolve, 0))
}

afterEach(() => {
    document.body.innerHTML = ''
})

describe('init', () => {
    test('re-initializing a scope replaces module bindings instead of stacking them', async () => {
        document.body.innerHTML = '<button data-lightbox="/photo-a.jpg">Open</button>'

        init(document)
        await flush()

        init(document)
        await flush()

        expect(document.querySelectorAll('dialog')).toHaveLength(1)
    })

    test('a re-initialization with no matching elements supersedes a pending earlier pass', async () => {
        document.body.innerHTML = '<button data-lightbox="/photo-a.jpg">Open</button>'

        init(document)

        document.body.innerHTML = ''
        init(document)
        await flush()

        expect(document.querySelector('dialog')).toBeNull()
    })

    test('tears down a module when its elements are gone on re-initialization', async () => {
        document.body.innerHTML = '<button data-lightbox="/photo-a.jpg">Open</button>'

        init(document)
        await flush()

        document.body.innerHTML = ''
        init(document)
        await flush()

        expect(document.querySelector('dialog')).toBeNull()
    })
})
