import { afterEach, describe, expect, test, vi } from 'vitest'
import { resolveDatasetKeyframes, resolveKeyframeValue, resolveOpacity } from '$lib/modules/animate'

vi.mock('$lib/stores/global', () => ({
    screen: {
        prefersReducedMotion: {
            current: false,
        },
    },
}))

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('animation keyframes', () => {
    test('normalizes scalar transform values into entry keyframes ending at rest', () => {
        const el = document.createElement('div')

        el.dataset.animate = 'y:-100;scale:0.95'

        vi.stubGlobal(
            'getComputedStyle',
            () =>
                ({
                    opacity: '0.1',
                    visibility: 'visible',
                }) as CSSStyleDeclaration,
        )

        expect(resolveDatasetKeyframes(el)).toMatchObject({
            opacity: [0, 0.1],
            scale: [0.95, 1],
            y: [-100, 0],
        })
    })

    test('preserves explicit transform keyframes', () => {
        expect(resolveKeyframeValue('y', [-100, 0])).toEqual([-100, 0])
    })

    test('falls back to full opacity for loading-hidden elements', () => {
        const el = document.createElement('div')

        vi.stubGlobal(
            'getComputedStyle',
            () =>
                ({
                    opacity: '0',
                    visibility: 'hidden',
                }) as CSSStyleDeclaration,
        )

        expect(resolveOpacity(el)).toBe(1)
    })
})
