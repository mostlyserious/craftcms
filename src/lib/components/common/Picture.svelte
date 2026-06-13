<script lang="ts">
    import type { PictureProps } from '$lib/components/common/props'
    import { pictureAttributes } from '$lib/util/image'

    let { src, breakpoints = {}, loading = 'lazy', class: className, ...rest }: PictureProps = $props()

    const [asset, args] = $derived(src)
    const width = $derived(args?.width ?? asset.width)
    const height = $derived(args?.height ?? asset.height)
    const attrs = $derived(pictureAttributes(src, breakpoints, loading))

    let isLoading = $state(true)

    function syncLoading(el: HTMLImageElement) {
        if (el.complete) {
            isLoading = false
        }
    }
</script>

<picture>
    {#each attrs.sources as source (source.media)}
        <source {...source} />
    {/each}

    <img
        {@attach syncLoading}
        {...rest}
        {...attrs.image}
        class={[className, { 'opacity-0': isLoading }]}
        style={isLoading
            ? `visibility:hidden;aspect-ratio:${width}/${height};max-width:${width}px;max-height:${height}px;`
            : undefined}
        onerror={() => (isLoading = false)}
        onload={() => (isLoading = false)}
    />
</picture>
