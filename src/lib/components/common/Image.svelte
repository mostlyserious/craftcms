<script>
    import { image } from '$lib/util/image'
    import { fade } from 'svelte/transition'
    import { ImagePropsSchema, ImportedSchema } from '$lib/components/common/schemas'

    /** @type {ZodInfer<typeof ImagePropsSchema>} */
    const props = $props()
    const { src, request, width, height, ...rest } = ImagePropsSchema.parse(props)

    const style = $derived(`width:100%;visibility:hidden;aspect-ratio:${width}/${height};max-width:${width}px;max-height:${height}px;`)

    /** @type {?HTMLImageElement} */
    let el = $state(null)

    if (!src && !request) {
        throw new Error('Image component requires a `src` or `request` prop')
    }

    $effect(() => {
        if (el && Array.isArray(src)) {
            image(el, src)
        }
    })
</script>

{#if Array.isArray(src)}
    <img {...rest} bind:this={el} in:fade />
{:else}
    {#await request}
        <div {...rest} {style}></div>
    {:then response}
        {@const { default: src } = ImportedSchema.parse(response)}
        <img {width} {height} {src} {...rest} in:fade />
    {/await}
{/if}
