import leftArrowIcon from '$fontawesome/solid/chevron-left.svg?raw'
import rightArrowIcon from '$fontawesome/solid/chevron-right.svg?raw'
import { ModuleSchema } from '$lib/schemas/core'
import { next, prev } from '$lib/util/cycle'
import markup from '$lib/util/markup'
import { lockScroll } from '$lib/util/scroll-lock'

const DEFAULT_GROUP = 'default'

const preloaded = new Set<string>()

export default ModuleSchema.implement(els => {
    const forward = document.createElement('button')
    const backward = document.createElement('button')
    const dialog = document.createElement('dialog')
    const groups: Record<string, HTMLElement[]> = {}
    const cleanups: Array<() => void> = []

    let current: HTMLElement | null = null
    let scrollRelease: (() => void) | null = null

    document.body.append(dialog)
    dialog.append(backward)
    dialog.append(forward)

    backward.type = 'button'
    backward.setAttribute('aria-label', 'previous image')
    backward.setAttribute(
        'class',
        'flex fixed left-4 bottom-6 z-50 transition sm:bottom-auto sm:top-1/2 hover:text-white text-white/60',
    )
    forward.type = 'button'
    forward.setAttribute('aria-label', 'next image')
    forward.setAttribute(
        'class',
        'flex fixed right-4 bottom-6 z-50 transition sm:bottom-auto sm:top-1/2 hover:text-white text-white/60',
    )
    dialog.setAttribute('aria-label', 'image viewer')
    dialog.setAttribute(
        'class',
        'overflow-auto fixed top-1/2 left-1/2 z-50 max-w-7xl rounded-md transform -translate-x-1/2 -translate-y-1/2 w-[90dvw] max-h-[90dvh] backdrop:bg-neutral-950/95',
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
    ) => {
        target.addEventListener(type, listener, options)
        cleanups.push(() => target.removeEventListener(type, listener, options))
    }

    const getGroup = (el: HTMLElement) => groups[el.dataset.lightboxGroup || DEFAULT_GROUP] || []

    const reportMissingSource = (el: HTMLElement) => {
        console.error(
            new Error('Missing lightbox src', {
                cause: el,
            }),
        )
    }

    const removeFromGroup = (el: HTMLElement) => {
        const group = getGroup(el)
        const index = group.indexOf(el)

        if (index !== -1) {
            group.splice(index, 1)
        }
    }

    const removeInvalidElement = (el: HTMLElement) => {
        reportMissingSource(el)
        removeFromGroup(el)
        el.remove()
    }

    const setNavigationVisible = (visible: boolean) => {
        forward.hidden = !visible
        backward.hidden = !visible
    }

    listen(window, 'keydown', event => {
        if (!(event instanceof KeyboardEvent)) {
            return
        }

        const { code } = event

        if (code === 'Escape') {
            close()
        }

        if (!dialog.open) {
            return
        }

        if (!current) {
            return
        }

        const collection = getGroup(current)

        if (code === 'ArrowLeft') {
            event.preventDefault()
            open(collection[prev(collection.indexOf(current), collection.length)])
        }

        if (code === 'ArrowRight') {
            event.preventDefault()
            open(collection[next(collection.indexOf(current), collection.length)])
        }
    })

    listen(forward, 'click', () => {
        if (!current) {
            return
        }

        const collection = getGroup(current)

        open(collection[next(collection.indexOf(current), collection.length)])
    })

    listen(backward, 'click', () => {
        if (!current) {
            return
        }

        const collection = getGroup(current)

        open(collection[prev(collection.indexOf(current), collection.length)])
    })

    const preload = (el: HTMLElement | undefined) => {
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

    const open = (el: HTMLElement | undefined) => {
        if (!el) {
            return
        }

        const src = el.dataset.lightbox ?? ''

        if (!src) {
            removeInvalidElement(el)
            return
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

        if (!dialog.open) {
            dialog.showModal()
        }

        if (!scrollRelease) {
            scrollRelease = lockScroll()
        }

        const n = next(collection.indexOf(current), collection.length)
        const p = prev(collection.indexOf(current), collection.length)

        preload(collection[n])
        preload(collection[p])
    }

    const close = () => {
        if (scrollRelease) {
            scrollRelease()
            scrollRelease = null
        }

        dialog.close()
        current?.focus()
    }

    listen(dialog, 'click', event => {
        if (event.target === dialog) {
            close()
        }
    })

    listen(dialog, 'cancel', () => close())

    for (const el of els) {
        const group = el.dataset.lightboxGroup || DEFAULT_GROUP
        const src = el.dataset.lightbox ?? ''

        if (!src) {
            removeInvalidElement(el)
            continue
        }

        if (!groups[group]) {
            groups[group] = []
        }

        groups[group].push(el)

        if (el instanceof HTMLButtonElement) {
            el.type = 'button'
        }

        listen(el, 'click', () => open(el))
        listen(el, 'mouseover', () => preload(el))
    }

    return () => {
        for (const cleanup of cleanups.reverse()) {
            cleanup()
        }

        close()
        dialog.remove()
        current = null
    }
})
