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

interface Binding {
    pass: number
    cleanup: (() => void) | null
}

const bindings = new WeakMap<Document | Element, Map<string, Binding>>()

export default function init(scope: Document | Element): void {
    let scopeBindings = bindings.get(scope)

    if (!scopeBindings) {
        scopeBindings = new Map()
        bindings.set(scope, scopeBindings)
    }

    for (const [selector, request] of object.entries(modules)) {
        const els = scope.querySelectorAll(selector)
        const binding = scopeBindings.get(selector) ?? { pass: 0, cleanup: null }
        const pass = ++binding.pass

        scopeBindings.set(selector, binding)

        if (!els.length) {
            binding.cleanup?.()
            binding.cleanup = null
            continue
        }

        request()
            .then(({ default: module }) => {
                if (binding.pass !== pass) {
                    return
                }

                binding.cleanup?.()

                const cleanup = module(els)

                binding.cleanup = typeof cleanup === 'function' ? cleanup : null
            })
            .catch(error => console.error(error))
    }

    for (const el of scope.querySelectorAll('[target=_blank]')) {
        el.setAttribute('rel', 'noopener')
    }
}
