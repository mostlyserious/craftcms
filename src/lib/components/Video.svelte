<script>
    import init from '$lib/init'
    import { fade } from 'svelte/transition'
    import { EmbedSchema } from '$lib/schemas'
    import focusTrap from '$lib/util/focus-trap'
    import { VideoSchema } from '$lib/components/schemas'
    import Icon from '$lib/components/common/Icon.svelte'

    /** @type {ZodInfer<typeof VideoSchema>} */
    const props = $props()
    const { uid, asset, playInline = true } = VideoSchema.parse(props)

    /** @type {?HTMLElement} */
    let backdrop = $state(null)
    let isActive = $state(false)
    let embed = $state(asset || null)

    if (!playInline) {
        /** @type {?Function} */
        let cleanup

        $effect(() => {
            document.body.style.overflow = isActive ? 'hidden' : 'auto'

            if (isActive && backdrop) {
                cleanup = focusTrap(backdrop)
            } else if (!isActive && cleanup) {
                cleanup()
                cleanup = null
            }
        })
    }

    if (!asset) {
        fetch(`/api/embed/${uid}`)
            .then(res => res.json())
            .then(res => embed = EmbedSchema.parse(res))
    }

    addEventListener('keydown', ({ code }) => {
        if (code === 'Escape') {
            isActive = false
        }
    })

    function toggleLoad() {
        isActive = !isActive
    }

    function warmup() {
        if (embed?.source === 'vimeo') {
            preconnect('https://player.vimeo.com')
            preconnect('https://i.vimeocdn.com')
            preconnect('https://f.vimeocdn.com')
            preconnect('https://fresnel.vimeocdn.com')
        }

        if (embed?.source === 'youtube') {
            preconnect('https://www.youtube-nocookie.com')
            preconnect('https://www.google.com')
            preconnect('https://googleads.g.doubleclick.net')
            preconnect('https://static.doubleclick.net')
        }
    }

    /** @param {string} url */
    function preconnect(url) {
        const link = document.createElement('link')

        link.href = url
        link.rel = 'preconnect'
        link.crossOrigin = 'true'

        document.head.appendChild(link)
    }

    /**
     * @param {HTMLIFrameElement} iframe
     * @param {'play'|'pause'} method
     * */
    function postMessage(iframe, method) {
        const contentWindow = iframe.contentWindow

        /** @type {?(this: GlobalEventHandlers, event: Event) => any} */
        let onLoad = null

        if (!contentWindow) {
            return
        }

        if (iframe.src.includes('vimeo')) {
            const message = { method, value: {} }

            onLoad = () => setTimeout(() => contentWindow.postMessage(message, '*'), 100)
            contentWindow.postMessage(message, '*')
        }

        if (iframe.src.includes('youtube')) {
            const message = JSON.stringify({ event: 'command', func: `${method}Video`, args: '' })

            onLoad = () => setTimeout(() => contentWindow.postMessage(message, '*'), 100)
            contentWindow.postMessage(message, '*')
        }

        if (onLoad) {
            iframe.onload = onLoad
        }
    }

    /**
     * @template {Array<unknown>} T
     * @template {(...args: T) => any} F
     * @param {?F} handler
     * @returns {(...args: T) => ReturnType<F>}
     * */
    function once(handler) {
        /** @type {ReturnType<F>} */
        let returned

        return (...args) => {
            if (handler) {
                returned = handler(...args)
                handler = null
            }

            return returned
        }
    }
</script>

<div class="grid gap-4" use:init>
    {#if embed}
        {#if isActive}
            <div class="flex inset-0 z-30 size-full bg-black/90"
                transition:fade={{ duration: 100 }}
                class:fixed={!playInline}
                bind:this={backdrop}>
                {#if !playInline}
                    <button type="button"
                        onmousedown={() => isActive = false}
                        class="fixed top-6 right-6 p-2 text-white rounded-full transition hover:bg-blue-500 bg-neutral-800">
                        <Icon request={import('$fontawesome/solid/xmark.svg?raw')}
                            class="fill-current size-8 shrink-0" />
                    </button>
                {/if}
                <div class="m-auto wrapper"
                    class:container={!playInline}
                    class:max-w-5xl={!playInline}
                    style:background-image={`url(${embed.image})`}
                    style:--aspect-ratio={`${embed.width}/${embed.height}`}>
                    <iframe width={embed.width} height={embed.height}
                        src={embed.src}
                        title={embed.title}
                        frameborder="0"
                        allowfullscreen
                        allow="autoplay; fullscreen; picture-in-picture; accelerometer; encrypted-media; gyroscope;"
                        use:postMessage={'play'}>
                    </iframe>
                </div>
            </div>
        {:else}
            <button type="button"
                onmouseenter={once(warmup)}
                onmousedown={toggleLoad}
                class="relative w-full group"
                aria-label="play video"
                style:--focusable-color="currentcolor"
                data-animate>
                <div class="flex absolute top-1/2 left-1/2 p-4 text-white rounded-full transition -translate-x-1/2 -translate-y-1/2 group-hover:bg-blue-500 bg-neutral-800 drop-shadow">
                    <Icon request={import('$fontawesome/solid/play.svg?raw')}
                        class="pl-1 size-8 shrink-0 fill-white" />
                </div>
                <img width={embed.width} height={embed.height}
                    src={embed.image}
                    alt={embed.title}
                    class="object-cover m-0 w-full rounded aspect-video"
                    loading="lazy">
            </button>
        {/if}
    {:else}
        <div class="w-full aspect-video"></div>
    {/if}
</div>

<style>
    .wrapper {
        position: relative;
        width: 100%;
        background-size: cover;
        background-position: center;
        aspect-ratio: var(--aspect-ratio);
        border-radius: var(--radius-md);
        overflow: hidden;

        & iframe {
            position: absolute;
            top: 0;
            right: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
        }
    }
</style>
