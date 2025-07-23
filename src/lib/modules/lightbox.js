import markup from '$lib/util/markup'
import { next, prev } from '$lib/util/cycle'
import leftArrowIcon from '$fontawesome/solid/chevron-left.svg?raw'
import rightArrowIcon from '$fontawesome/solid/chevron-right.svg?raw'

/**
 * @type {Record<PropertyKey, Array<HTMLElement>>}
 * */
const groups = {}
const DEFAULT_GROUP = 'default'

/**
 * @param {NodeListOf<Element>} els - A collection of DOM elements.
 * */
export default els => {
    const forward = document.createElement('button')
    const backward = document.createElement('button')
    const backdrop = document.createElement('div')
    const dialog = document.createElement('dialog')

    /** @type {HTMLElement} */
    let current

    document.body.append(backdrop)
    backdrop.append(dialog)
    backdrop.append(forward)
    backdrop.append(backward)

    backward.setAttribute('class', 'flex fixed left-4 bottom-6 z-50 transition sm:bottom-auto sm:top-1/2 hover:text-white text-brand-orange')
    forward.setAttribute('class', 'flex fixed right-4 bottom-6 z-50 transition sm:bottom-auto sm:top-1/2 hover:text-white text-brand-orange')
    backdrop.setAttribute('class', 'fixed inset-0 z-20 opacity-0 transition pointer-events-none bg-brand-gray-darker/95')
    dialog.setAttribute('class', 'overflow-auto fixed top-1/2 left-1/2 z-50 max-w-7xl rounded-md transform -translate-x-1/2 -translate-y-1/2 w-[90dvw] max-h-[90dvh]')

    forward.innerHTML = markup(rightArrowIcon, {
        class: 'm-auto fill-current size-8',
    })

    backward.innerHTML = markup(leftArrowIcon, {
        class: 'm-auto fill-current size-8',
    })

    addEventListener('keydown', ({ code, shiftKey }) => {
        if (code === 'Escape') {
            close()
        }

        if (!dialog.hasAttribute('open')) {
            return
        }

        const collection = groups[current.dataset.lightboxGroup || DEFAULT_GROUP]

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

    forward.addEventListener('click', event => {
        event.stopPropagation()

        const collection = groups[current.dataset.lightboxGroup || DEFAULT_GROUP]
        const i = next(collection.indexOf(current), collection.length)

        close()
        open(collection[i])
    })

    backward.addEventListener('click', event => {
        event.stopPropagation()

        const collection = groups[current.dataset.lightboxGroup || DEFAULT_GROUP]
        const i = prev(collection.indexOf(current), collection.length)

        close()
        open(collection[i])
    })

    /** @param {HTMLElement} el */
    const preload = el => {
        const src = el.dataset.lightbox ?? ''
        const img = document.createElement('img')

        img.setAttribute('src', src)
    }

    /** @param {HTMLElement} el */
    const open = el => {
        const src = el.dataset.lightbox ?? ''

        if (!src) {
            el.remove()
            throw new Error('Missing lightbox src', {
                cause: el,
            })
        }

        let img = dialog.querySelector('img')

        current = el

        if (groups[current.dataset.lightboxGroup || DEFAULT_GROUP].length === 1) {
            forward.remove()
            backward.remove()
        }

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
        document.body.style.overflow = 'hidden'

        const collection = groups[current.dataset.lightboxGroup || DEFAULT_GROUP]
        const n = next(collection.indexOf(current), collection.length)
        const p = next(collection.indexOf(current), collection.length)

        preload(collection[n])
        preload(collection[p])
    }

    const close = () => {
        document.body.style.overflow = 'auto'
        backdrop.classList.add('opacity-0')
        backdrop.classList.add('pointer-events-none')
        dialog.removeAttribute('open')
    }

    for (const el of els) {
        if (el instanceof HTMLElement) {
            const group = el.dataset.lightboxGroup || DEFAULT_GROUP

            if (!groups[group]) {
                groups[group] = []
            }

            groups[group].push(el)

            el.setAttribute('type', 'submit')
            el.addEventListener('click', () => open(el))
            el.addEventListener('mouseover', () => preload(el))
            backdrop.addEventListener('click', () => close())
        }
    }
}
