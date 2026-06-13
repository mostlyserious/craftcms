<script lang="ts">
    import { fade } from 'svelte/transition'
    import type { ImageProps } from '$lib/components/common/props'
    import { ImportedSchema } from '$lib/schemas/core'
    import { image } from '$lib/util/image'

    let { src, request, width, height, ...rest }: ImageProps = $props()

    const style = $derived(
        `visibility:hidden;aspect-ratio:${width}/${height};max-width:${width}px;max-height:${height}px;`,
    )

    let el = $state<HTMLImageElement | null>(null)

    $effect.pre(() => {
        if (!src && !request) {
            throw new Error('Image component requires a `src` or `request` prop')
        }
    })

    $effect(() => {
        if (el && Array.isArray(src)) {
            image(el, src)
        }
    })
</script>

{#if Array.isArray(src)}
    <img {...rest} bind:this={el} in:fade />
{:else}
    <svelte:boundary>
        {@const { default: src } = ImportedSchema.parse(await request)}

        <img {width} {height} {src} {...rest} in:fade />

        {#snippet pending()}
            <img
                {width}
                {height}
                {...rest}
                {style}
                src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
            />
        {/snippet}
    </svelte:boundary>
{/if}
