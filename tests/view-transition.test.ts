import { afterEach, describe, expect, test, vi } from 'vitest'
import { viewTransition } from '$lib/util/view-transition'

function stubStartViewTransition() {
    Object.defineProperty(document, 'startViewTransition', {
        configurable: true,
        value: vi.fn((callback: () => void | Promise<void>) => {
            const updateCallbackDone = Promise.resolve().then(callback)

            return {
                finished: updateCallbackDone,
                ready: Promise.resolve(),
                skipTransition: vi.fn(),
                types: new Set<string>() as ViewTransitionTypeSet,
                updateCallbackDone,
            } satisfies ViewTransition
        }),
    })
}

afterEach(() => {
    Reflect.deleteProperty(document, 'startViewTransition')
    vi.restoreAllMocks()
})

describe('viewTransition', () => {
    test('resolves with the handler result when view transitions are supported', async () => {
        stubStartViewTransition()

        await expect(viewTransition(() => 'complete')).resolves.toBe('complete')
    })

    test('rejects when the handler rejects during a view transition', async () => {
        const error = new Error('transition failed')

        stubStartViewTransition()

        await expect(viewTransition(() => Promise.reject(error))).rejects.toBe(error)
    })
})
