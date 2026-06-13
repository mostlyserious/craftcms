<script module lang="ts">
    const FOCUSABLE = 'a,button,input,select,textarea,[tabindex="0"]'

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
    import { FocusableSchema } from '$lib/schemas/app'
    import { lockScroll } from '$lib/util/scroll-lock'

    type ModalPosition = 'top-left' | 'top' | 'top-right' | 'right' | 'bottom-right' | 'bottom' | 'bottom-left' | 'left'

    interface ModalProps {
        id: string
        position?: ModalPosition | null
        overlay?: 'polite' | 'assertive'
        container?: `max-w-${string}`
        onclose?: () => void
        children?: Snippet<[]>
    }

    const {
        id,
        position = null,
        overlay = 'assertive',
        container = 'max-w-7xl',
        onclose,
        children,
    }: ModalProps = $props()

    let focusable = $state<HTMLElement[] | null>(null)
    let wasActive = $state(false)

    $effect(() => {
        const isActive = active === id

        if (wasActive && active === null && onclose) {
            onclose()
        }

        wasActive = isActive
    })

    function alignment(position: ModalPosition | null): string {
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

    function onKeydown(event: KeyboardEvent): void {
        if (event.code === 'Escape' && active) {
            close()
        } else if (event.code === 'Tab' && active && focusable) {
            const first = focusable[0]
            const last = focusable[focusable.length - 1]

            if (event.shiftKey) {
                if (document.activeElement === first) {
                    event.preventDefault()
                    last?.focus()
                }
            } else if (document.activeElement === last) {
                event.preventDefault()
                first?.focus()
            }
        }
    }

    function onBackdropClick(event: MouseEvent): void {
        if (event.target === event.currentTarget) {
            close()
        }
    }

    function onBackdropKeydown(event: KeyboardEvent): void {
        if (event.target !== event.currentTarget) {
            return
        }

        if (event.code === 'Enter' || event.code === 'Space') {
            event.preventDefault()
            close()
        }
    }

    function modal(el: HTMLElement): () => void {
        let focusTimeout: ReturnType<typeof setTimeout> | null = null
        let releaseScroll: (() => void) | null = null

        if (overlay === 'assertive') {
            focusable = FocusableSchema.parse(Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)))

            focusTimeout = setTimeout(() => {
                releaseScroll = lockScroll()
                el.focus()
            }, 10)
        }

        return () => {
            if (focusTimeout) {
                clearTimeout(focusTimeout)
            }

            if (releaseScroll) {
                releaseScroll()
                releaseScroll = null
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
        onclick={onBackdropClick}
        onkeydown={onBackdropKeydown}
        transition:blur={{ duration: 150 }}
        {@attach modal}
    >
        <div class="container {container}">
            <div class="max-h-vh-90 overflow-auto">
                <div
                    class="pointer-events-auto relative overflow-hidden"
                    class:border={overlay === 'polite'}
                    class:border-brand-blue-light={overlay === 'polite'}
                >
                    <button
                        class="absolute top-4 right-4 z-10 flex items-center border bg-white p-0.5 transition hover:bg-black hover:text-white disabled:pointer-events-none disabled:opacity-30"
                        aria-label="close modal"
                        onclick={close}
                    >
                        <Icon request={import('$fontawesome/solid/x.svg?raw')} class="size-4 fill-current" />
                    </button>
                    {@render children()}
                </div>
            </div>
        </div>
    </div>
{/if}
