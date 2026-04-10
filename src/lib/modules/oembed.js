import Video from '$lib/components/common/Video.svelte'
import { EmbedSchema } from '$lib/schemas'
import { $app } from '$lib/stores/global'
import { CsrfSchema } from '$lib/stores/schemas'
import wrap from '$lib/util/wrap'
import { mount } from 'svelte'

/**
 * @param {NodeListOf<Element>} els - A collection of DOM elements.
 * */
export default async els => {
    const { name: csrfTokenName, value: csrfTokenValue } = CsrfSchema.parse(await $app.csrf)

    for (const el of els) {
        if (el instanceof HTMLElement) {
            const target = wrap(el)

            fetch('/actions/general/oembed/', {
                method: 'POST',
                mode: 'cors',
                cache: 'no-cache',
                credentials: 'same-origin',
                redirect: 'follow',
                body: new URLSearchParams({
                    [csrfTokenName]: csrfTokenValue,
                    url: el.getAttribute('url') || '',
                }),
            })
                .then(res => res.json())
                .then(res => {
                    const asset = EmbedSchema.parse(res)

                    target.innerHTML = ''

                    mount(Video, {
                        target,
                        props: { asset, playInline: true },
                    })
                })
                .catch(error => {
                    console.error('Failed to load embed:', error)
                })
        }
    }
}
