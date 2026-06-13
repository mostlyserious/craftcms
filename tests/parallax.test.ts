import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import parallax, { measureBaselineControlFromRect, measureLiveControlFromRect } from '$lib/modules/parallax'

class TestResizeObserver {
    static instances: TestResizeObserver[] = []

    #callback: ResizeObserverCallback
    #elements = new Set<Element>()

    constructor(callback: ResizeObserverCallback) {
        this.#callback = callback
        TestResizeObserver.instances.push(this)
    }

    observe(el: Element): void {
        this.#elements.add(el)
    }

    disconnect(): void {
        this.#elements.clear()
    }

    trigger(): void {
        const entries = [...this.#elements].map(target => ({ target }) as ResizeObserverEntry)

        this.#callback(entries, this as unknown as ResizeObserver)
    }
}

function cleanup(value: unknown): void {
    if (typeof value === 'function') {
        value()
    }
}

beforeEach(() => {
    TestResizeObserver.instances = []
    vi.stubGlobal('ResizeObserver', TestResizeObserver)
    Object.defineProperty(window, 'innerHeight', {
        configurable: true,
        value: 900,
    })
    Object.defineProperty(window, 'scrollY', {
        configurable: true,
        value: 50,
    })
})

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('parallax', () => {
    test('sets and cleans up parallax custom properties', () => {
        document.body.innerHTML = '<div data-parallax></div>'

        const target = document.querySelector<HTMLElement>('[data-parallax]')

        if (!target) {
            throw new Error('Parallax fixture was not created.')
        }

        Object.defineProperty(target, 'getBoundingClientRect', {
            value: () => ({
                height: 400,
                top: 100,
            }),
        })

        const detach = parallax(document.querySelectorAll<HTMLElement>('[data-parallax]'))

        expect(target.style.getPropertyValue('--parallax-control')).toBe('0.2308')
        expect(target.style.getPropertyValue('--parallax-offset')).toBe('0.1538')

        cleanup(detach)

        expect(target.style.getPropertyValue('--parallax-control')).toBe('')
        expect(target.style.getPropertyValue('--parallax-offset')).toBe('')
    })

    test('preserves parallax measurement behavior', () => {
        expect(measureLiveControlFromRect({ top: 100, height: 400 }, 900)).toBeCloseTo(0.2308, 4)
        expect(measureBaselineControlFromRect({ top: 100, height: 400 }, 900, 50)).toBeCloseTo(0.1538, 4)
    })
})
