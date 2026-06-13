<script lang="ts">
    import Icon from '$lib/components/common/Icon.svelte'
    import Modal, { open } from '$lib/components/common/Modal.svelte'
    import type { VideoBlockProps } from '$lib/components/common/props'

    type PostMessageMethod = 'play' | 'pause'

    const { asset, playInline = true }: VideoBlockProps = $props()

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

    function preconnect(url: string) {
        const link = document.createElement('link')

        link.href = url
        link.rel = 'preconnect'
        link.crossOrigin = 'true'

        document.head.appendChild(link)
    }

    function postMessage(method: PostMessageMethod) {
        return (iframe: HTMLIFrameElement) => {
            const contentWindow = iframe.contentWindow

            let onLoad: GlobalEventHandlers['onload'] = null

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

    function playVideo(el: HTMLVideoElement) {
        void el.play()

        return () => {
            el.pause()
        }
    }

    function once<T extends unknown[], R>(handler: ((..._args: T) => R) | null): (..._args: T) => R | undefined {
        let returned: R | undefined

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
        <div
            class="inset-center group-hover:bg-brand-yellow absolute flex rounded-full bg-white p-4 text-black transition"
        >
            <Icon request={import('$fontawesome/solid/play.svg?raw')} class="size-8 shrink-0 fill-current" />
        </div>
    {/snippet}

    {#if embed}
        <button
            type="button"
            onmouseenter={once(warmup)}
            onclick={playInline ? activateInline : openModal}
            class="group relative w-full"
            aria-label="play video"
            style:--focusable-color="currentcolor"
        >
            {@render icon()}
            <img
                width={embed.width}
                height={embed.height}
                src={embed.image}
                alt={embed.title}
                class="m-0 aspect-video w-full rounded-lg object-cover"
                loading="lazy"
            />
        </button>
    {:else if upload}
        <button
            type="button"
            onclick={playInline ? activateInline : openModal}
            class="group relative w-full"
            aria-label="play video"
            style:--focusable-color="currentcolor"
        >
            {@render icon()}
            <video
                class="pointer-events-none block aspect-video w-full rounded-lg bg-black"
                muted
                playsinline
                preload="metadata"
            >
                <source src={upload.src} type={upload.mime} />
            </video>
        </button>
    {/if}
{/snippet}

{#snippet frame()}
    {#if embed}
        <div
            class="wrapper"
            style:background-image="url({embed.image})"
            style:--aspect-ratio="{embed.width}/{embed.height}"
        >
            <iframe
                width={embed.width}
                height={embed.height}
                src={embed.src}
                title={embed.title}
                frameborder="0"
                allowfullscreen
                allow="autoplay; fullscreen; picture-in-picture; accelerometer; encrypted-media; gyroscope;"
                {@attach postMessage('play')}
            >
            </iframe>
        </div>
    {:else if upload}
        <video
            class="block aspect-video w-full rounded-lg bg-black"
            controls
            autoplay
            playsinline
            preload="metadata"
            {@attach playVideo}
        >
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
