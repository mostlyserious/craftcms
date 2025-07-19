import * as object from '$lib/util/object'
import { ImageSourceSchema } from '$lib/schemas'

const { objectStorageUrl, assetsUrl } = window.$app

/**
 * @param {HTMLImageElement} el
 * @param {ZodInfer<typeof ImageSourceSchema>} source
 * */
export function image(el, source) {
    const [ asset, args ] = ImageSourceSchema.parse(source)

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

        if (args && args.facepad) {
            args.fit = 'facearea'
        }

        args.crop = args.crop ? args.crop : 'faces,center'
    }

    if (asset && asset.uid) {
        const src = imgix(asset.src, args || {})
        const src2x = imgix(asset.src, { ...(args || {}), width: width * 2, height: height * 2 })
        const alt = asset.alt

        if (!width && height) {
            width = Math.floor(Math.min(asset.height, height) * (asset.width / asset.height))
        }

        if (!height && width) {
            height = Math.floor(Math.min(asset.width, width) * (asset.height / asset.width))
        }

        const attributes = {
            width,
            height,
            alt,
            srcset: `${src}, ${src2x} 2x`,
            src: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
            loading: 'lazy',
        }

        for (const [ attr, value ] of object.entries(attributes)) {
            if (value !== null && value !== undefined) {
                el.setAttribute(attr, String(value))
            } else {
                el.removeAttribute(attr)
            }
        }
    } else if (asset) {
        const attributes = {
            width,
            height,
            src: `https://picsum.photos/seed/${asset}/${width}/${height || width}`,
            alt: 'Placeholder Image',
            loading: 'lazy',
        }

        for (const [ attr, value ] of object.entries(attributes)) {
            el.setAttribute(attr, String(value))
        }
    }

    return el
}

/**
 * @param {string} url
 * */
export function imgix(url, query = {}) {
    if (url) {
        url = url.replace(objectStorageUrl, assetsUrl)

        if ((/\.gif$/).test(url)) {
            return url
        }

        return `${url}${url.includes('?') ? '&' : '?'}${new URLSearchParams(query)}`
    }

    return ''
}
