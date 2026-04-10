<script>
    import Icon from '$lib/components/common/Icon.svelte'
    import Modal, { open } from '$lib/components/common/Modal.svelte'

    /**
     * @import { VideoBlockSchema } from '$lib/components/common/schemas'
     * @type {ZodInfer<typeof VideoBlockSchema>}
     * */
    const { asset, playInline = true } = $props()

    const id = $props.id()
    const embed = $derived(asset.type === 'embed' ? asset : null)
    const upload = $derived(asset.type === 'upload' ? asset : null)

    let isActive = $state(false)

    function activateInline() {
        if (embed || upload) {
            isActive = true
        }
    }

    function openModal() {
        if (embed) {
            warmup()
        }

        open(id)
    }

    function warmup() {
        if (!embed) {
            return
        }

        if (embed.source === 'vimeo') {
            preconnect('https://player.vimeo.com')
            preconnect('https://i.vimeocdn.com')
            preconnect('https://f.vimeocdn.com')
            preconnect('https://fresnel.vimeocdn.com')
        }

        if (embed.source === 'youtube') {
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
     * @param {'play'|'pause'} method
     * */
    function postMessage(method) {
        /** @param {HTMLIFrameElement} iframe */
        return iframe => {
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

            if (!onLoad) {
                return
            }

            const previousOnLoad = iframe.onload

            iframe.onload = onLoad

            return () => {
                if (iframe.onload === onLoad) {
                    iframe.onload = previousOnLoad
                }
            }
        }
    }

    /** @param {HTMLVideoElement} el */
    function playVideo(el) {
        el.play()

        return () => {
            el.pause()
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

{#snippet preview()}
    {#snippet icon()}
        <div class="flex absolute p-4 text-black bg-white rounded-full transition inset-center group-hover:bg-brand-yellow">
            <Icon request={import('$fontawesome/solid/play.svg?raw')}
                class="fill-current size-8 shrink-0" />
        </div>
    {/snippet}

    {#if embed}
        <button type="button"
            onmouseenter={once(warmup)}
            onclick={playInline ? activateInline : openModal}
            class="relative w-full group"
            aria-label="play video"
            style:--focusable-color="currentcolor">
            {@render icon()}
            <img width={embed.width} height={embed.height}
                src={embed.image}
                alt={embed.title}
                class="object-cover m-0 w-full rounded-lg aspect-video"
                loading="lazy">
        </button>
    {:else if upload}
        <button type="button"
            onclick={playInline ? activateInline : openModal}
            class="relative w-full group"
            aria-label="play video"
            style:--focusable-color="currentcolor">
            {@render icon()}
            <video class="block w-full bg-black rounded-lg pointer-events-none aspect-video"
                muted
                playsinline
                preload="metadata">
                <source src={upload.src} type={upload.mime} />
            </video>
        </button>
    {/if}
{/snippet}

{#snippet frame()}
    {#if embed}
        <div class="wrapper"
            style:background-image="url({embed.image})"
            style:--aspect-ratio="{embed.width}/{embed.height}">
            <iframe width={embed.width} height={embed.height}
                src={embed.src}
                title={embed.title}
                frameborder="0"
                allowfullscreen
                allow="autoplay; fullscreen; picture-in-picture; accelerometer; encrypted-media; gyroscope;"
                {@attach postMessage('play')}>
            </iframe>
        </div>
    {:else if upload}
        <video class="block w-full bg-black rounded-lg aspect-video"
            controls
            autoplay
            playsinline
            preload="metadata"
            {@attach playVideo}>
            <source src={upload.src} type={upload.mime} />
        </video>
    {/if}
{/snippet}

{#if playInline && isActive}
    {@render frame()}
{:else}
    {@render preview()}

    {#if !playInline}
        <Modal {id}>
            {@render frame()}
        </Modal>
    {/if}
{/if}

<style>
    .wrapper {
        position: relative;
        overflow: hidden;
        width: 100%;
        aspect-ratio: var(--aspect-ratio);
        border-radius: var(--radius-md);
        background-position: center;
        background-size: cover;

        & iframe {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
    }
</style>
