import type { ModuleHandler } from '$lib/schemas/core'
import * as object from '$lib/util/object'

const modules = {
    '[data-parallax]': () => import('$lib/modules/parallax'),
    '[data-controls]': () => import('$lib/modules/controls'),
    '[data-property]': () => import('$lib/modules/property'),
    '[data-lightbox]': () => import('$lib/modules/lightbox'),
    '[data-animate]': () => import('$lib/modules/animate'),
    '[data-toggle]': () => import('$lib/modules/toggle'),
    'oembed[url]': () => import('$lib/modules/oembed'),
    'x-svelte': () => import('$lib/sveltify'),
} satisfies Record<string, () => Promise<{ default: ModuleHandler }>>

const cleanups = new WeakMap<Document | Element, Map<string, () => void>>()

export default function init(scope: Document | Element): void {
    let scopeCleanups = cleanups.get(scope)

    if (!scopeCleanups) {
        scopeCleanups = new Map()
        cleanups.set(scope, scopeCleanups)
    }

    for (const [selector, request] of object.entries(modules)) {
        const els = scope.querySelectorAll(selector)

        if (!els.length) {
            scopeCleanups.get(selector)?.()
            scopeCleanups.delete(selector)
            continue
        }

        request()
            .then(({ default: module }) => {
                scopeCleanups.get(selector)?.()
                scopeCleanups.delete(selector)

                const cleanup = module(els)

                if (typeof cleanup === 'function') {
                    scopeCleanups.set(selector, cleanup)
                }
            })
            .catch(error => console.error(error))
    }

    for (const el of scope.querySelectorAll('[target=_blank]')) {
        el.setAttribute('rel', 'noopener')
    }
}
