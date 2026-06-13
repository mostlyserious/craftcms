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

    test('restores nav controls after opening a single-item group', () => {
        const cleanup = mountLightbox(`
            <button data-lightbox="/single.jpg" data-lightbox-group="single">Single</button>
            <button data-lightbox="/photo-a.jpg" data-lightbox-group="gallery">One</button>
            <button data-lightbox="/photo-b.jpg" data-lightbox-group="gallery">Two</button>
        `)
        const buttons = Array.from(document.querySelectorAll<HTMLElement>('[data-lightbox]'))
        const backdrop = document.querySelector<HTMLDivElement>('div')

        if (!backdrop) {
            throw new Error('Lightbox backdrop was not created.')
        }

        const navButtons = Array.from(backdrop.children).filter(
            (child): child is HTMLButtonElement => child instanceof HTMLButtonElement,
        )

        buttons[0]?.click()

        expect(navButtons).toHaveLength(2)
        expect(navButtons.every(button => button.hidden)).toBe(true)

        backdrop.click()
        buttons[1]?.click()

        expect(navButtons.every(button => button.parentElement === backdrop)).toBe(true)
        expect(navButtons.every(button => !button.hidden)).toBe(true)

        cleanup()
    })

    test('removes empty source elements from navigation groups', () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
        const cleanup = mountLightbox(`
            <button data-lightbox="" data-lightbox-group="gallery">Broken</button>
            <button data-lightbox="/photo-a.jpg" data-lightbox-group="gallery">One</button>
            <button data-lightbox="/photo-b.jpg" data-lightbox-group="gallery">Two</button>
        `)
        const buttons = Array.from(document.querySelectorAll<HTMLElement>('[data-lightbox]'))

        expect(error).toHaveBeenCalledOnce()
        expect(buttons).toHaveLength(2)

        buttons[0]?.click()
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }))

        expect(document.querySelector<HTMLImageElement>('dialog img')?.src).toContain('/photo-b.jpg')

        cleanup()
    })
})
