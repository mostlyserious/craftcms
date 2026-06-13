import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import lightbox from '$lib/modules/lightbox'

function mountLightbox(markup: string): () => void {
    document.body.innerHTML = markup

    const cleanup = lightbox(document.querySelectorAll<HTMLElement>('[data-lightbox]'))

    if (typeof cleanup !== 'function') {
        throw new Error('Lightbox did not return a cleanup function.')
    }

    return cleanup
}

beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
})

afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
})

describe('lightbox', () => {
    test('removes global listeners and generated markup during cleanup', () => {
        const addListener = vi.spyOn(window, 'addEventListener')
        const removeListener = vi.spyOn(window, 'removeEventListener')
        const cleanup = mountLightbox('<button data-lightbox="/photo-a.jpg">Open</button>')
        const keydownListener = addListener.mock.calls.find(([type]) => type === 'keydown')?.[1]

        cleanup()

        expect(keydownListener).toBeDefined()
        expect(
            removeListener.mock.calls.some(([type, listener]) => type === 'keydown' && listener === keydownListener),
        ).toBe(true)
        expect(document.querySelector('dialog')).toBeNull()
    })

    test('restores the prior body overflow style when closed', () => {
        document.body.style.overflow = 'visible'

        const cleanup = mountLightbox('<button data-lightbox="/photo-a.jpg">Open</button>')
        const button = document.querySelector<HTMLElement>('[data-lightbox]')
        const backdrop = document.querySelector<HTMLElement>('div')

        button?.click()

        expect(document.body.style.overflow).toBe('hidden')

        backdrop?.click()

        expect(document.body.style.overflow).toBe('visible')

        cleanup()
    })

    test('does not retain stale group elements across initializations', () => {
        const firstCleanup = mountLightbox(
            '<button data-lightbox="/old-photo.jpg" data-lightbox-group="gallery">Old</button>',
        )

        firstCleanup()

        const secondCleanup = mountLightbox(
            '<button data-lightbox="/new-photo.jpg" data-lightbox-group="gallery">New</button>',
        )
        const button = document.querySelector<HTMLElement>('[data-lightbox]')

        button?.click()
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }))

        expect(document.querySelector<HTMLImageElement>('dialog img')?.src).toContain('/new-photo.jpg')

        secondCleanup()
    })

    test('registers one backdrop close listener per initialization', () => {
        const divListener = vi.spyOn(HTMLDivElement.prototype, 'addEventListener')
        const cleanup = mountLightbox(`
            <button data-lightbox="/photo-a.jpg">One</button>
            <button data-lightbox="/photo-b.jpg">Two</button>
            <button data-lightbox="/photo-c.jpg">Three</button>
        `)

        expect(divListener.mock.calls.filter(([type]) => type === 'click')).toHaveLength(1)

        cleanup()
    })
})
