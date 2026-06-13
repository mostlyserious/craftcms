import leftArrowIcon from '$fontawesome/solid/chevron-left.svg?raw'
import rightArrowIcon from '$fontawesome/solid/chevron-right.svg?raw'
import { ModuleSchema } from '$lib/schemas/core'
import { next, prev } from '$lib/util/cycle'
import markup from '$lib/util/markup'
import { lockScroll } from '$lib/util/scroll-lock'

const DEFAULT_GROUP = 'default'

const preloaded = new Set<string>()

export default ModuleSchema.implement((els: NodeListOf<HTMLElement>) => {
    const forward = document.createElement('button')
    const backward = document.createElement('button')
    const backdrop = document.createElement('div')
    const dialog = document.createElement('dialog')
    const groups: Record<string, HTMLElement[]> = {}
    const cleanups: Array<() => void> = []

    let current: HTMLElement | null = null
    let scrollRelease: (() => void) | null = null

    document.body.append(backdrop)
    backdrop.append(dialog)
    backdrop.append(forward)
    backdrop.append(backward)

    backward.setAttribute(
        'class',
        'flex fixed left-4 bottom-6 z-50 transition sm:bottom-auto sm:top-1/2 hover:text-white text-brand-orange',
    )
    forward.setAttribute(
        'class',
        'flex fixed right-4 bottom-6 z-50 transition sm:bottom-auto sm:top-1/2 hover:text-white text-brand-orange',
    )
    backdrop.setAttribute(
        'class',
        'fixed inset-0 z-20 opacity-0 transition pointer-events-none bg-brand-gray-darker/95',
    )
    dialog.setAttribute(
        'class',
        'overflow-auto fixed top-1/2 left-1/2 z-50 max-w-7xl rounded-md transform -translate-x-1/2 -translate-y-1/2 w-[90dvw] max-h-[90dvh]',
    )

    forward.innerHTML = markup(rightArrowIcon, {
        class: 'm-auto fill-current size-8',
    })

    backward.innerHTML = markup(leftArrowIcon, {
        class: 'm-auto fill-current size-8',
    })

    const listen = (
        target: EventTarget,
        type: string,
        listener: (event: Event) => void,
        options?: AddEventListenerOptions | boolean,
    ): void => {
        target.addEventListener(type, listener, options)
        cleanups.push(() => target.removeEventListener(type, listener, options))
    }

    const getGroup = (el: HTMLElement): HTMLElement[] => groups[el.dataset.lightboxGroup || DEFAULT_GROUP] || []

    const setNavigationVisible = (visible: boolean): void => {
        forward.hidden = !visible
        backward.hidden = !visible
    }

    listen(window, 'keydown', event => {
        if (!(event instanceof KeyboardEvent)) {
            return
        }

        const { code, shiftKey } = event

        if (code === 'Escape') {
            close()
        }

        if (!dialog.hasAttribute('open')) {
            return
        }

        if (!current) {
            return
        }

        const collection = getGroup(current)

        if (code === 'ArrowLeft' || (code === 'Tab' && shiftKey)) {
            const i = prev(collection.indexOf(current), collection.length)

            close()
            open(collection[i])

            current.focus()
        }

        if (code === 'ArrowRight' || (code === 'Tab' && !shiftKey)) {
            const i = next(collection.indexOf(current), collection.length)

            close()
            open(collection[i])

            current.focus()
        }
    })

    listen(forward, 'click', event => {
        event.stopPropagation()

        if (!current) {
            return
        }

        const collection = getGroup(current)
        const i = next(collection.indexOf(current), collection.length)

        close()
        open(collection[i])
    })

    listen(backward, 'click', event => {
        event.stopPropagation()

        if (!current) {
            return
        }

        const collection = getGroup(current)
        const i = prev(collection.indexOf(current), collection.length)

        close()
        open(collection[i])
    })

    const preload = (el: HTMLElement | undefined): void => {
        if (!el) {
            return
        }

        const src = el.dataset.lightbox ?? ''

        if (!src || preloaded.has(src)) {
            return
        }

        const img = document.createElement('img')

        preloaded.add(src)
        img.setAttribute('src', src)
    }

    const open = (el: HTMLElement | undefined): void => {
        if (!el) {
            return
        }

        const src = el.dataset.lightbox ?? ''

        if (!src) {
            el.remove()
            throw new Error('Missing lightbox src', {
                cause: el,
            })
        }

        let img = dialog.querySelector('img')

        current = el
        const collection = getGroup(current)

        setNavigationVisible(collection.length > 1)

        if (!img) {
            img = document.createElement('img')
            img.classList.add('mx-auto')
            dialog.append(img)
        }

        if (img.src !== src) {
            img.setAttribute('src', src)
        }

        backdrop.classList.remove('opacity-0')
        backdrop.classList.remove('pointer-events-none')

        dialog.setAttribute('open', '')

        if (!scrollRelease) {
            scrollRelease = lockScroll()
        }

        const n = next(collection.indexOf(current), collection.length)
        const p = prev(collection.indexOf(current), collection.length)

        preload(collection[n])
        preload(collection[p])
    }

    const close = (): void => {
        if (scrollRelease) {
            scrollRelease()
            scrollRelease = null
        }

        backdrop.classList.add('opacity-0')
        backdrop.classList.add('pointer-events-none')
        dialog.removeAttribute('open')
    }

    listen(backdrop, 'click', () => close())

    for (const el of els) {
        const group = el.dataset.lightboxGroup || DEFAULT_GROUP

        if (!groups[group]) {
            groups[group] = []
        }

        groups[group].push(el)

        el.setAttribute('type', 'submit')
        listen(el, 'click', () => open(el))
        listen(el, 'mouseover', () => preload(el))
    }

    return () => {
        for (const cleanup of cleanups.reverse()) {
            cleanup()
        }

        close()
        backdrop.remove()
        current = null
    }
})
