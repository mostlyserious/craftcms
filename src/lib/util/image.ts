import {
    ImageSourceSchema,
    PictureSourcesSchema,
    type ImageSource,
    type ImageTransformArgs,
    type PictureSources,
} from '$lib/schemas/media'
import { craft } from '$lib/stores/global'
import * as object from '$lib/util/object'

type ImageAttributes = Record<string, string | number>
type Loading = 'lazy' | 'eager'

interface PictureAttributes {
    image: ImageAttributes
    sources: ImageAttributes[]
}

function normalizeLoading(loading: string) {
    return loading === 'eager' ? 'eager' : 'lazy'
}

function setAttributes(el: Element, attributes: ImageAttributes) {
    for (const [attr, value] of object.entries(attributes)) {
        if (value !== null && value !== undefined) {
            el.setAttribute(attr, String(value))
        } else {
            el.removeAttribute(attr)
        }
    }
}

function attributes(source: ImageSource, loading = 'lazy') {
    const [asset, parsedArgs] = ImageSourceSchema.parse(source)

    const args: ImageTransformArgs | null = parsedArgs ? { ...parsedArgs } : null
    const attrs: ImageAttributes = {}
    const normalizedLoading = normalizeLoading(loading)

    let width = 0
    let height = 0

    if (args) {
        width = Number(args.width ?? '0')
        height = Number(args.height ?? '0')

        if (asset && asset.focalPoint) {
            args['fp-x'] = asset.focalPoint.x
            args['fp-y'] = asset.focalPoint.y
            args.crop = asset.hasFocalPoint ? 'focalpoint' : args.crop
        }

        if (args.facepad) {
            args.fit = 'facearea'
        }

        args.crop = args.crop ? args.crop : 'faces,center'
    }

    if (asset.uid) {
        const src = imgix(asset.src, args || {})
        const src2x = imgix(asset.src, { ...args, width: width * 2, height: height * 2 })
        const alt = asset.alt

        if (!width && height) {
            width = Math.floor(Math.min(asset.height, height) * (asset.width / asset.height))
        }

        if (!height && width) {
            height = Math.floor(Math.min(asset.width, width) * (asset.height / asset.width))
        }

        Object.assign(attrs, {
            width,
            height,
            alt,
            srcset: `${src}, ${src2x} 2x`,
            src: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
            loading: normalizedLoading,
        })
    }

    return {
        asset,
        attrs,
    }
}

export function image(el: HTMLImageElement, source: ImageSource): HTMLImageElement {
    const { attrs } = attributes(source, 'lazy')

    setAttributes(el, attrs)

    return el
}

export function pictureAttributes(
    source: ImageSource,
    sources: PictureSources = {},
    loading: Loading = 'lazy',
): PictureAttributes {
    const { asset, attrs: imageAttrs } = attributes(source, loading)
    const parsedSources = PictureSourcesSchema.parse(sources)
    const sorted = object.entries(parsedSources).sort(([a], [b]) => Number.parseFloat(b) - Number.parseFloat(a))

    let previousBreakpoint: string | null = null
    const sourcesAttrs: ImageAttributes[] = []

    for (const [breakpoint, args] of sorted) {
        const sourceAttrs: ImageAttributes = {
            ...attributes([asset, args], 'lazy').attrs,
            media: previousBreakpoint
                ? `(min-width: ${breakpoint}) and (max-width: calc(${previousBreakpoint} - 1px))`
                : `(min-width: ${breakpoint})`,
        }

        delete sourceAttrs.src
        delete sourceAttrs.alt
        delete sourceAttrs.loading

        sourcesAttrs.push(sourceAttrs)

        previousBreakpoint = breakpoint
    }

    return {
        image: imageAttrs,
        sources: sourcesAttrs,
    }
}

export function picture(
    el: HTMLPictureElement,
    source: ImageSource,
    sources: PictureSources = {},
    loading: Loading = 'lazy',
): void {
    const attrs = pictureAttributes(source, sources, loading)

    let image = el.querySelector('img')

    if (!image) {
        image = document.createElement('img')
        el.append(image)
    }

    for (const extra of Array.from(el.querySelectorAll('img'))) {
        if (extra !== image) {
            extra.remove()
        }
    }

    setAttributes(image, attrs.image)

    for (const sourceNode of Array.from(el.querySelectorAll('source'))) {
        sourceNode.remove()
    }

    for (const sourceAttrs of attrs.sources) {
        const sourceNode = document.createElement('source')

        setAttributes(sourceNode, sourceAttrs)
        el.insertBefore(sourceNode, image)
    }
}

export function imgix(url: string, query: ImageAttributes = {}): string {
    if (!url) {
        return ''
    }

    if (url.endsWith('.gif')) {
        return url
    }

    url = url.replace(craft.objectStorageUrl, craft.imgixUrl)

    query.auto = query.auto ? query.auto : 'format,compress'

    const search = new URLSearchParams(
        Object.fromEntries(Object.entries(query).map(([key, value]) => [key, String(value)])),
    ).toString()

    if (!search) {
        return url
    }

    return `${url}${url.includes('?') ? '&' : '?'}${search}`
}
