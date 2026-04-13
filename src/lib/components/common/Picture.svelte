<script>
    import { picture } from '$lib/util/image'

    /**
     * @import { PicturePropsSchema } from '$lib/components/common/schemas'
     * @type {ZodInfer<typeof PicturePropsSchema>}
     * */
    let { src, breakpoints = {}, loading = 'lazy', ...rest } = $props()

    const [asset, args] = $derived(src)
    const width = $derived(args?.width ?? asset.width)
    const height = $derived(args?.height ?? asset.height)
    const style = $derived(`visibility:hidden;aspect-ratio:${width}/${height};max-width:${width}px;max-height:${height}px;`)

    let isLoading = $state(true)
</script>

<picture {@attach el => picture(el, src, breakpoints, loading)}>
    <img style={isLoading ? style : undefined} {...rest} class:opacity-0={isLoading} onload={() => isLoading = false} />
</picture>
