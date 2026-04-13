import { ImageSourceSchema, PictureSourcesSchema } from '$lib/schemas/media'
import { craft } from '$lib/stores/global'
import * as object from '$lib/util/object'

/**
 * @param {string} loading
 * @returns {'lazy'|'eager'}
 * */
function normalizeLoading(loading) {
    return loading === 'eager' ? 'eager' : 'lazy'
}

/**
 * @param {Element} el
 * @param {Record<string, string|number>} attributes
 * */
function setAttributes(el, attributes) {
    for (const [attr, value] of object.entries(attributes)) {
        if (value !== null && value !== undefined) {
            el.setAttribute(attr, String(value))
        } else {
            el.removeAttribute(attr)
        }
    }
}

/**
 * @param {ZodInfer<typeof ImageSourceSchema>} source
 * @param {string} [loading]
 * */
function attributes(source, loading = 'lazy') {
    const [asset, parsedArgs] = ImageSourceSchema.parse(source)

    const args = parsedArgs ? { ...parsedArgs } : null
    /** @type {Record<string, string|number>} */
    const attrs = {}
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

    return {
        asset,
        attrs,
    }
}

/**
 * @param {HTMLImageElement} el
 * @param {ZodInfer<typeof ImageSourceSchema>} source
 * */
export function image(el, source) {
    const { attrs } = attributes(source, 'lazy')

    setAttributes(el, attrs)

    return el
}

/**
 * @param {HTMLPictureElement} el
 * @param {ZodInfer<typeof ImageSourceSchema>} source
 * @param {ZodInfer<typeof PictureSourcesSchema>} [sources]
 * @param {'lazy'|'eager'} [loading]
 * */
export function picture(el, source, sources = {}, loading = 'lazy') {
    const { asset, attrs } = attributes(source, loading)
    const parsedSources = PictureSourcesSchema.parse(sources)

    /** @type {?HTMLImageElement} */
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

    setAttributes(image, attrs)

    for (const sourceNode of Array.from(el.querySelectorAll('source'))) {
        sourceNode.remove()
    }

    const sorted = object.entries(parsedSources).sort(([a], [b]) => Number.parseFloat(b) - Number.parseFloat(a))

    let previousBreakpoint = null

    for (const [breakpoint, args] of sorted) {
        const sourceNode = document.createElement('source')
        /** @type {Record<string, string|number>} */
        const sourceAttrs = {
            ...attributes([asset, args], 'lazy').attrs,
            media: previousBreakpoint
                ? `(min-width: ${breakpoint}) and (max-width: calc(${previousBreakpoint} - 1px))`
                : `(min-width: ${breakpoint})`,
        }

        delete sourceAttrs.src
        delete sourceAttrs.alt
        delete sourceAttrs.loading

        setAttributes(sourceNode, sourceAttrs)
        el.insertBefore(sourceNode, image)

        previousBreakpoint = breakpoint
    }
}

/**
 * @param {string} url
 * @param {Record<string, string|number>} [query]
 * */
export function imgix(url, query = {}) {
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
