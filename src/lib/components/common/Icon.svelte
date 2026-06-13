<script lang="ts">
    import type { IconProps } from '$lib/components/common/props'
    import { ImportedSchema } from '$lib/schemas/core'
    import markup from '$lib/util/markup'

    const { request, ...rest }: IconProps = $props()

    const { default: svg } = $derived(ImportedSchema.parse(await request))

    function filterMarkupAttrs(attrs: Record<string, unknown>) {
        const filtered: Record<string, string | number> = {}

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
