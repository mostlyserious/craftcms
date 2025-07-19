import { mount } from 'svelte'
import wrap from '$lib/util/wrap'
import { EmbedSchema } from '$lib/schemas'
import Video from '$lib/components/Video.svelte'

/**
 * @param {NodeListOf<Element>} els - A collection of DOM elements.
 * */
export default async els => {
    const { name: csrfTokenName, value: csrfTokenValue } = await window.$app.csrf

    for (const el of els) {
        if (el instanceof HTMLElement) {
            const target = wrap(el)

            /** @type {ZodInfer<typeof EmbedSchema>} */
            const asset = await fetch('/actions/general/oembed/', {
                method: 'POST',
                mode: 'cors',
                cache: 'no-cache',
                credentials: 'same-origin',
                redirect: 'follow',
                body: new URLSearchParams({
                    [csrfTokenName]: csrfTokenValue,
                    url: el.getAttribute('url') || '',
                }),
            }).then(res => res.json()).then(res => EmbedSchema.parse(res))

            target.innerHTML = ''

            mount(Video, {
                target,
                props: { asset, playInline: true },
            })
        }
    }
}
