<script module lang="ts">
    const FOCUSABLE =
        'a[href],button,input,select,textarea,iframe,audio[controls],video[controls],[contenteditable]:not([contenteditable="false"]),[tabindex]:not([tabindex="-1"])'

    let active = $state<string | null>(null)

    export function open(id: string): void {
        active = id
    }

    export function close(): void {
        active = null
    }
</script>

<script lang="ts">
    import type { Snippet } from 'svelte'
    import { blur } from 'svelte/transition'
    import Icon from '$lib/components/common/Icon.svelte'
    import { lockScroll } from '$lib/util/scroll-lock'

    type ModalPosition = 'top-left' | 'top' | 'top-right' | 'right' | 'bottom-right' | 'bottom' | 'bottom-left' | 'left'

    interface ModalProps {
        id: string
        label?: string
        position?: ModalPosition | null
        overlay?: 'polite' | 'assertive'
        container?: `max-w-${string}`
        onclose?: () => void
        children?: Snippet<[]>
    }

    const {
        id,
        label,
        position = null,
        overlay = 'assertive',
        container = 'max-w-7xl',
        onclose,
        children,
    }: ModalProps = $props()

    let dialogEl: HTMLElement | null = null
    let wasActive = $state(false)

    $effect(() => {
        const isActive = active === id

        if (wasActive && !isActive && onclose) {
            onclose()
        }

        wasActive = isActive
    })

    function focusables(): HTMLElement[] {
        if (!dialogEl) {
            return []
        }

        return Array.from(dialogEl.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
            el => !el.hasAttribute('disabled') && (el.checkVisibility?.() ?? true),
        )
    }

    function alignment(position: ModalPosition | null) {
        switch (position) {
            case 'top-left':
                return 'justify-start items-start'
            case 'top':
                return 'justify-center items-start'
            case 'top-right':
                return 'justify-end items-start'
            case 'right':
                return 'items-center'
            case 'bottom-right':
                return 'justify-end items-end'
            case 'bottom':
                return 'justify-center'
            case 'bottom-left':
                return 'justify-start items-end'
            case 'left':
                return 'items-center'
            default:
                return 'items-center justify-center'
        }
    }

    function onKeydown(event: KeyboardEvent) {
        if (active !== id) {
            return
        }

        if (event.code === 'Escape') {
            close()
        } else if (event.code === 'Tab' && overlay === 'assertive') {
            const items = focusables()
            const first = items[0]
            const last = items[items.length - 1]

            if (!first || !last) {
                event.preventDefault()
                return
            }

            const focused = document.activeElement
            const outside = !(focused instanceof HTMLElement) || !dialogEl?.contains(focused)

            if (event.shiftKey) {
                if (outside || focused === first) {
                    event.preventDefault()
                    last.focus()
                }
            } else if (outside || focused === last) {
                event.preventDefault()
                first.focus()
            }
        }
    }

    function onBackdropClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            close()
        }
    }

    function onBackdropKeydown(event: KeyboardEvent) {
        if (event.target !== event.currentTarget) {
            return
        }

        if (event.code === 'Enter' || event.code === 'Space') {
            event.preventDefault()
            close()
        }
    }

    function modal(el: HTMLElement) {
        const previous = document.activeElement

        let focusTimeout: ReturnType<typeof setTimeout> | null = null
        let releaseScroll: (() => void) | null = null

        dialogEl = el

        if (overlay === 'assertive') {
            focusTimeout = setTimeout(() => {
                releaseScroll = lockScroll()
                el.focus()
            }, 10)
        }

        return () => {
            dialogEl = null

            if (focusTimeout) {
                clearTimeout(focusTimeout)
            }

            if (releaseScroll) {
                releaseScroll()
                releaseScroll = null
            }

            if (previous instanceof HTMLElement) {
                previous.focus()
            }
        }
    }
</script>

<svelte:window onkeydown={onKeydown} />

{#if active === id && children}
    <div
        class="fixed inset-0 z-50 flex h-dvh py-6 shadow-lg {overlay === 'assertive' ? 'bg-black/20' : ''} {alignment(
            position,
        )}"
        class:pointer-events-none={overlay === 'polite'}
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onclick={onBackdropClick}
        onkeydown={onBackdropKeydown}
        transition:blur={{ duration: 150 }}
        {@attach modal}>
        <div class="container {container}">
            <div class="max-h-vh-90 overflow-auto">
                <div
                    class="pointer-events-auto relative overflow-hidden"
                    class:border={overlay === 'polite'}
                    class:border-neutral-300={overlay === 'polite'}>
                    <button
                        class="absolute top-4 right-4 z-10 flex items-center border bg-white p-0.5 transition hover:bg-black hover:text-white disabled:pointer-events-none disabled:opacity-30"
                        aria-label="close modal"
                        onclick={close}>
                        <Icon request={import('$fontawesome/solid/x.svg?raw')} class="size-4 fill-current" />
                    </button>
                    {@render children()}
                </div>
            </div>
        </div>
    </div>
{/if}
