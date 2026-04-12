import { mount } from 'svelte'
import Video from '$lib/components/common/Video.svelte'
import { EmbedSchema, ModuleSchema } from '$lib/schemas'
import { craft } from '$lib/stores/global'
import { CsrfSchema } from '$lib/stores/schemas'
import wrap from '$lib/util/wrap'

export default ModuleSchema.implement(async els => {
    const { name: csrfTokenName, value: csrfTokenValue } = CsrfSchema.parse(await craft.csrf())

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
