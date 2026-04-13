<script>
    import { ImportedSchema } from '$lib/schemas/core'
    import markup from '$lib/util/markup'

    /**
     * @import { IconPropsSchema } from '$lib/components/common/props'
     * @type {ZodInfer<typeof IconPropsSchema>}
     * */
    const { request, ...rest } = $props()

    const { default: svg } = $derived(ImportedSchema.parse(await request))

    /**
     * @param {Record<string, unknown>} attrs
     * @returns {Record<string, string|number>}
     * */
    function filterMarkupAttrs(attrs) {
        /** @type {Record<string, string|number>} */
        const filtered = {}

        for (const [key, value] of Object.entries(attrs)) {
            if (typeof value === 'string' || typeof value === 'number') {
                filtered[key] = value
            }
        }

        return filtered
    }

    const attrs = $derived(filterMarkupAttrs(rest))
</script>

<svelte:boundary>
    {@html markup(svg, attrs)}

    {#snippet pending()}
        <div {...attrs} style:visibility="hidden"></div>
    {/snippet}
</svelte:boundary>
