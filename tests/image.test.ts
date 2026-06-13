import { mount, tick, unmount } from 'svelte'
import { describe, expect, test, vi } from 'vitest'
import Picture from '$lib/components/common/Picture.svelte'
import type { ImageSource } from '$lib/schemas/media'
import { pictureAttributes } from '$lib/util/image'

vi.mock('$lib/stores/global', () => ({
    craft: {
        imgixUrl: 'https://imgix.example.com',
        objectStorageUrl: 'https://storage.example.com',
    },
}))

const asset = {
    uid: '0f990d39-28e1-4133-9b5a-610e0754b889',
    src: 'https://storage.example.com/images/test.jpg',
    alt: 'Test image',
    width: 1600,
    height: 900,
    extension: 'jpg',
    hasFocalPoint: false,
    focalPoint: {
        x: 0.5,
        y: 0.5,
    },
}

const source = [asset, { height: 360, width: 640 }] satisfies ImageSource

describe('pictureAttributes', () => {
    test('sorts breakpoint sources from largest to smallest', () => {
        const attrs = pictureAttributes(source, {
            '48rem': {
                height: 450,
                width: 800,
            },
            '64rem': {
                height: 675,
                width: 1200,
            },
        })

        expect(attrs.sources.map(source => source.media)).toEqual([
            '(min-width: 64rem)',
            '(min-width: 48rem) and (max-width: calc(64rem - 1px))',
        ])
        expect(attrs.sources[0]).not.toHaveProperty('alt')
        expect(attrs.sources[0]).not.toHaveProperty('loading')
        expect(attrs.sources[0]).not.toHaveProperty('src')
    })

    test('uses imgix srcsets and preserves eager loading', () => {
        const attrs = pictureAttributes(source, {}, 'eager')

        expect(attrs.image).toMatchObject({
            alt: 'Test image',
            height: 360,
            loading: 'eager',
            src: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
            width: 640,
        })
        expect(attrs.image.srcset).toEqual(expect.stringContaining('https://imgix.example.com/images/test.jpg'))
        expect(attrs.image.srcset).toEqual(expect.stringContaining('width=640'))
        expect(attrs.image.srcset).toEqual(expect.stringContaining('height=360'))
    })
})

describe('Picture', () => {
    test('clears loading opacity after an image error', async () => {
        const target = document.createElement('div')
        const component = mount(Picture, {
            target,
            props: {
                src: source,
            },
        })
        const img = target.querySelector('img')

        expect(img?.className).toContain('opacity-0')

        img?.dispatchEvent(new Event('error'))
        await tick()

        expect(img?.className).not.toContain('opacity-0')

        unmount(component)
    })
})
