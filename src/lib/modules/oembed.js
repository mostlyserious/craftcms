import { mount } from 'svelte'
import Video from '$lib/components/common/Video.svelte'
import { CsrfSchema } from '$lib/schemas/app'
import { ModuleSchema } from '$lib/schemas/core'
import { EmbedSchema } from '$lib/schemas/media'
import { craft } from '$lib/stores/global'
import wrap from '$lib/util/wrap'

export default ModuleSchema.implement(els => {
    craft
        .csrf()
        .then(data => CsrfSchema.parse(data))
        .then(({ name: csrfTokenName, value: csrfTokenValue }) => {
            for (const el of els) {
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
        })
        .catch(error => {
            console.error('Failed to fetch CSRF token:', error)
        })
})
