<script>
    import markup from '$lib/util/markup'
    import { ImportedSchema } from '$lib/schemas'

    /**
     * @import { IconPropsSchema } from '$lib/components/common/schemas'
     * @type {ZodInfer<typeof IconPropsSchema>}
     * */
    const { request, ...rest } = $props()

    const { default: svg } = $derived(ImportedSchema.parse(await request))
</script>

<svelte:boundary>
    {@html markup(svg, rest)}

    {#snippet pending()}
        <div {...rest} style:visibility="hidden"></div>
    {/snippet}
</svelte:boundary>
