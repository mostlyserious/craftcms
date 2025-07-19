import * as object from '$lib/util/object'

const modules = {
    '[data-controls]': () => import('$lib/modules/controls'),
    '[data-property]': () => import('$lib/modules/property'),
    '[data-lightbox]': () => import('$lib/modules/lightbox'),
    '[data-animate]': () => import('$lib/modules/animate'),
    '[data-toggle]': () => import('$lib/modules/toggle'),
    'oembed[url]': () => import('$lib/modules/oembed'),
    'x-svelte': () => import('$lib/sveltify'),
}

/**
 * @param {Document|Element} scope - The root element or document where the search will be executed.
 * */
export default function init(scope) {
    for (const [ selector, request ] of object.entries(modules)) {
        const els = scope.querySelectorAll(selector)

        if (els.length) {
            request().then(({ default: module }) => module(els))
        }
    }

    for (const el of scope.querySelectorAll('[target=_blank]')) {
        el.setAttribute('rel', 'noopener')
    }
}
