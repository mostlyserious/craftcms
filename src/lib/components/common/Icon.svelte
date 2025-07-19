<script>
    import markup from '$lib/util/markup'
    import { ImportedSchema, IconPropsSchema } from '$lib/components/common/schemas'

    /** @type {ZodInfer<typeof IconPropsSchema>} */
    const props = $props()
    const { request, ...rest } = IconPropsSchema.parse(props)
</script>

{#await request}
    <div {...rest} style:visibility="hidden"></div>
{:then response}
    {@const { default: svg } = ImportedSchema.parse(response)}
    {@html markup(svg, rest)}
{/await}
