<script>
    import { image } from '$lib/util/image'
    import { fade } from 'svelte/transition'
    import { ImportedSchema } from '$lib/schemas'

    /**
     * @import { ImagePropsSchema } from '$lib/components/common/schemas'
     * @type {ZodInfer<typeof ImagePropsSchema>}
     * */
    let { src, request, width, height, ...rest } = $props()

    const style = $derived(`visibility:hidden;aspect-ratio:${width}/${height};max-width:${width}px;max-height:${height}px;`)

    /** @type {?HTMLImageElement} */
    let el = $state(null)

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
            <img {width} {height} {...rest} {style} src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" />
        {/snippet}
    </svelte:boundary>
{/if}
