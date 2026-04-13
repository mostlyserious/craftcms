<script module>
    const FOCUSABLE = 'a,button,input,select,textarea,[tabindex="0"]'

    /** @type {?string} */
    let active = $state(null)

    /** @param {string} id */
    export function open(id) {
        active = id
    }

    export function close() {
        active = null
    }
</script>

<script>
    import { blur } from 'svelte/transition'
    import Icon from '$lib/components/common/Icon.svelte'
    import { lockScroll } from '$lib/util/scroll-lock'

    /**
     * @typedef {'top-left'|'top'|'top-right'|'right'|'bottom-right'|'bottom'|'bottom-left'|'left'} ModalPosition
     * */

    /**
     * @import { Snippet } from 'svelte'
     * @type {{ id: string; position?: ?ModalPosition; overlay?: 'polite'|'assertive'; container?: `max-w-${string}`; onclose?: () => void; children?: Snippet<[]> }}
     * */
    const { id, position = null, overlay = 'assertive', container = 'max-w-7xl', onclose, children } = $props()

    /** @type {NodeListOf<Element>?} */
    let focusable = $state(null)
    let wasActive = $state(false)

    $effect(() => {
        const isActive = active === id

        if (wasActive && active === null && onclose) {
            onclose()
        }

        wasActive = isActive
    })

    /** @param {?ModalPosition} position */
    function alignment(position) {
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

    /** @param {KeyboardEvent} event */
    function onKeydown(event) {
        if (event.code === 'Escape' && active) {
            close()
        } else if (event.code === 'Tab' && active && focusable) {
            const first = focusable[0]
            const last = focusable[focusable.length - 1]

            if (event.shiftKey) {
                if (document.activeElement === first && last instanceof HTMLElement) {
                    event.preventDefault()
                    last.focus()
                }
            } else if (document.activeElement === last && first instanceof HTMLElement) {
                event.preventDefault()
                first.focus()
            }
        }
    }

    /** @param {MouseEvent} event */
    function onBackdropClick(event) {
        if (event.target === event.currentTarget) {
            close()
        }
    }

    /** @param {KeyboardEvent} event */
    function onBackdropKeydown(event) {
        if (event.target !== event.currentTarget) {
            return
        }

        if (event.code === 'Enter' || event.code === 'Space') {
            event.preventDefault()
            close()
        }
    }

    /** @param {HTMLElement} el */
    function modal(el) {
        let focusTimeout = null
        /** @type {?() => void} */
        let releaseScroll = null

        if (overlay === 'assertive') {
            focusable = el ? el.querySelectorAll(FOCUSABLE) : null

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

<svelte:window on:keydown={onKeydown} />

{#if active === id && children}
    <div class="flex py-6 fixed inset-0 z-50 h-dvh-100 shadow-lg {overlay === 'assertive' ? 'bg-black/20' : ''} {alignment(position)}"
        class:pointer-events-none={overlay === 'polite'}
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        onclick={onBackdropClick}
        onkeydown={onBackdropKeydown}
        transition:blur={{ duration: 150 }}
        {@attach modal}>
        <div class="container {container}">
            <div class="overflow-auto max-h-vh-90">
                <div class="overflow-hidden relative pointer-events-auto"
                    class:border={overlay === 'polite'}
                    class:border-brand-blue-light={overlay === 'polite'}>
                    <button class="flex absolute top-4 right-4 z-10 items-center p-0.5 bg-white border transition hover:text-white hover:bg-black disabled:opacity-30 disabled:pointer-events-none"
                        aria-label="close modal"
                        onclick={close}>
                        <Icon request={import('$fontawesome/solid/x.svg?raw')}
                            class="fill-current size-4" />
                    </button>
                    {@render children()}
                </div>
            </div>
        </div>
    </div>
{/if}
