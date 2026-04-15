import { mount, createRawSnippet } from 'svelte'
import * as z from 'zod/mini'
import { ExampleSchema } from '$lib/components/props'
import { ModuleSchema } from '$lib/schemas/core'
import component from '$lib/util/component'
import * as object from '$lib/util/object'
import resolveValue from '$lib/util/resolve-value'

const components = {
    example: component(() => import('$lib/components/Example.svelte'), ExampleSchema),
}

/**
 * Processes elements to replace with Svelte components.
 * */
export default ModuleSchema.implement(els => {
    const ComponentHandlesSchema = z.enum(object.keys(components))

    for (const target of els) {
        const component = ComponentHandlesSchema.parse(target.getAttribute('component'))
        const [request, schema] = components[component]
        /** @type {Record<PropertyKey, unknown>} */
        const data = {}

        request()
            .then(({ default: Component }) => {
                const templates = target.querySelectorAll(':scope > template')
                /** @type {Record<PropertyKey, ReturnType<typeof createRawSnippet>>} */
                const snippets = {}

                for (const template of templates) {
                    const snippet = template.getAttribute('snippet')
                    const markup = template.innerHTML.trim()
                    const name = snippet || (template.hasAttribute('slot') ? null : 'children')

                    if (!name) {
                        continue
                    }

                    if (snippets[name]) {
                        throw new Error(`[snippet=${name}] is already defined.`)
                    }

                    snippets[name] = createRawSnippet(() => ({
                        render: () => markup,
                    }))
                }

                target.innerHTML = ''

                for (const [key, value] of object.entries(target.dataset)) {
                    if (snippets[key]) {
                        throw new Error(`[snippet=${key}] conflicts with [data-${key}].`)
                    }

                    data[key] = typeof value === 'string' ? resolveValue(value) : value
                }

                mount(Component, {
                    target,
                    props: {
                        ...schema.parse(data),
                        ...snippets,
                    },
                })

                target.replaceWith(...target.childNodes)
            })
            .catch(error => {
                console.error(`[sveltify] Failed to mount component "${component}"`, error)
            })
    }
})
