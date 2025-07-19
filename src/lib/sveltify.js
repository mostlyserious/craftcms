import * as z from 'zod/mini'
import * as object from '$lib/util/object'
import { mount, createRawSnippet } from 'svelte'
import resolveValue from '$lib/util/resolve-value'

const components = {
    'video': () => import('$lib/components/Video.svelte'),
}

/** Processes elements to replace with Svelte components.
 * @param {NodeListOf<Element>} els - Elements to be processed.
 */
export default function(els) {
    const ComponentHandlesSchema = z.enum(object.keys(components))

    for (const target of els) {
        if (target instanceof HTMLElement) {
            const component = ComponentHandlesSchema.parse(target.getAttribute('component'))
            const request = components[component]
            /** @type {Record<PropertyKey, unknown>} */
            const data = {}

            request().then(({ default: Component }) => {
                const templates = target.querySelectorAll(':scope > template')
                /** @type {Record<PropertyKey, ReturnType<typeof createRawSnippet>>} */
                const snippets = {}

                for (const template of templates) {
                    const markup = template.innerHTML.trim()
                    const name = template.getAttribute('snippet') || 'children'

                    if (snippets[name]) {
                        throw new Error(`[snippet=${name}] is already defined.`)
                    }

                    snippets[name] = createRawSnippet(() => ({
                        render: () => markup,
                    }))
                }

                target.innerHTML = ''

                for (const [ key, value ] of object.entries(target.dataset)) {
                    if (snippets[key]) {
                        throw new Error(`[snippet=${key}] conflicts with [data-${key}].`)
                    }

                    data[key] = (typeof value === 'string')
                        ? resolveValue(value)
                        : value
                }

                mount(Component, { target, props: {
                    ...data,
                    ...snippets,
                } })

                target.replaceWith(...target.childNodes)
            })
        }
    }
}
