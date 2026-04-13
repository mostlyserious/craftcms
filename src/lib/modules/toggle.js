import * as z from 'zod/mini'
import { ModuleSchema } from '$lib/schemas/core'
import { lockScroll } from '$lib/util/scroll-lock'

/**
 * @typedef {Object} ToggleBinding
 * @property {HTMLElement} el
 * @property {HTMLElement} target
 * @property {null|(() => void)} scrollRelease
 * @property {string} className
 * @property {boolean} lockScroll
 * @property {boolean} trapFocus
 * @property {boolean} required
 * */

const FOCUSABLE = 'a,button,input,select,textarea,[tabindex="0"]'

/** @type {Set<HTMLElement>} */
const collection = new Set()
const FocusableSchema = z.array(z.instanceof(HTMLElement))

export default ModuleSchema.implement(els => {
    /** @type {Map<HTMLElement, AbortController>} */
    const controllers = new Map()
    /** @type {ToggleBinding[]} */
    const bindings = []
    /** @type {Array<() => void>} */
    const cleanups = []

    /**
     * @param {EventTarget} target
     * @param {string} type
     * @param {(event: Event) => void} listener
     * @param {AddEventListenerOptions|boolean} [options]
     * */
    const listen = (target, type, listener, options) => {
        target.addEventListener(type, listener, options)
        cleanups.push(() => target.removeEventListener(type, listener, options))
    }

    listen(document.body, 'click', () => closeAll(bindings, controllers))
    listen(window, 'keydown', event => {
        if (event instanceof KeyboardEvent && event.code === 'Escape') {
            closeAll(bindings, controllers)
        }
    })

    for (const el of els) {
        if (collection.has(el)) {
            continue
        }

        collection.add(el)

        const target = getTargetFor(el)
        const binding = {
            el,
            target,
            scrollRelease: null,
            className: el.dataset.toggle ? el.dataset.toggle : 'is-active',
            lockScroll: el.dataset.toggleLockScroll !== undefined,
            trapFocus: el.dataset.toggleTrapFocus !== undefined,
            required: el.dataset.toggleRequired !== undefined,
        }

        bindings.push(binding)

        listen(target, 'click', event => {
            for (const node of getFocusableFor(target)) {
                if (event.target instanceof Node && node.isSameNode(event.target)) {
                    return
                }
            }

            event.stopPropagation()
        })

        handleArias(el, target.classList.contains(binding.className))
        handleInertables(target, !target.classList.contains(binding.className), binding.className)

        listen(el, 'click', event => {
            const focusable = getFocusableFor(target)

            focusable.unshift(el)
            event.stopPropagation()

            for (const other of bindings) {
                const { toggleGroup: toggleGroupA, toggleScope: toggleScopeA } = el.dataset

                const { toggleGroup: toggleGroupB, toggleScope: toggleScopeB } = other.el.dataset

                if (
                    other.className === binding.className &&
                    !other.target.isSameNode(target) &&
                    (!toggleGroupA || toggleGroupB !== toggleGroupA) &&
                    (!toggleScopeB || toggleScopeB === toggleScopeA)
                ) {
                    closeToggle(other, controllers, false)
                }
            }

            if (target.classList.contains(binding.className)) {
                closeToggle(binding, controllers, false)
            } else {
                openToggle(binding, controllers, focusable)
            }
        })
    }

    return () => {
        for (const cleanup of cleanups.reverse()) {
            cleanup()
        }

        closeAll(bindings, controllers, true)

        for (const controller of controllers.values()) {
            controller.abort()
        }

        controllers.clear()
    }
})

/**
 * @param {HTMLElement} target
 * */
function getFocusableFor(target) {
    return FocusableSchema.parse(target.querySelectorAll(FOCUSABLE))
}

/**
 * @param {HTMLElement} el
 * */
function getTargetFor(el) {
    const fallback = el.parentElement
    /** @type {?HTMLElement} */
    const prefered = el.dataset.toggleTarget ? document.querySelector(el.dataset.toggleTarget) : null

    if (prefered) {
        return prefered
    }

    if (fallback) {
        return fallback
    }

    throw new Error('No target found.', { cause: el })
}

/**
 * @param {ToggleBinding[]} bindings
 * @param {Map<HTMLElement, AbortController>} controllers
 * @param {boolean} [force]
 * */
function closeAll(bindings, controllers, force = false) {
    for (const binding of bindings) {
        if (force || !binding.el.dataset.toggleScope) {
            closeToggle(binding, controllers, force)
        }
    }
}

/**
 * @param {ToggleBinding} binding
 * @param {Map<HTMLElement, AbortController>} controllers
 * @param {boolean} force
 * */
function closeToggle(binding, controllers, force) {
    if (!force && binding.required) {
        return
    }

    handleTrapFocus(controllers, trapFocusHandler, false, [], binding.el)
    handleInertables(binding.target, true, binding.className)
    handleScroll(binding, false)
    handleArias(binding.el, false)
    binding.target.classList.remove(binding.className)
}

/**
 * @param {ToggleBinding} binding
 * @param {Map<HTMLElement, AbortController>} controllers
 * @param {HTMLElement[]} focusable
 * */
function openToggle(binding, controllers, focusable) {
    handleTrapFocus(controllers, trapFocusHandler, binding.trapFocus, focusable, binding.el)
    handleInertables(binding.target, false, binding.className)
    handleScroll(binding, true)
    handleArias(binding.el, true)
    binding.target.classList.add(binding.className)
}

/**
 * @param {HTMLElement} target
 * @param {boolean} hide
 * @param {string} className
 * */
function handleInertables(target, hide, className) {
    /** @type {NodeListOf<HTMLElement>} */
    const inertables = target.querySelectorAll(`[data-toggle-inert="${className}"]`)

    for (const inertable of inertables) {
        if (hide) {
            inertable.setAttribute('inert', '')
        } else {
            inertable.removeAttribute('inert')
        }
    }
}

/**
 * @param {Map<HTMLElement, AbortController>} controllers
 * @param {(event: KeyboardEvent, focusable: HTMLElement[]) => void} handler
 * @param {boolean} enabled
 * @param {HTMLElement[]} focusable
 * @param {HTMLElement} el
 * */
function handleTrapFocus(controllers, handler, enabled, focusable, el) {
    const controller = controllers.get(el)

    if (controller) {
        controller.abort()
        controllers.delete(el)
    }

    if (enabled) {
        const nextController = new AbortController()

        controllers.set(el, nextController)
        window.addEventListener(
            'keydown',
            event => {
                if (event instanceof KeyboardEvent) {
                    handler(event, focusable)
                }
            },
            {
                signal: nextController.signal,
            },
        )
    }
}

/**
 * @param {KeyboardEvent} event
 * @param {HTMLElement[]} focusable
 * */
function trapFocusHandler(event, focusable) {
    if (event.code === 'Tab') {
        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (focusable.length === 1) {
            event.preventDefault()
        }

        if (event.shiftKey) {
            if (document.activeElement === first) {
                event.preventDefault()
                last.focus()
            }
        } else if (document.activeElement === last) {
            event.preventDefault()
            first.focus()
        }
    }
}

/**
 * @param {HTMLElement} el
 * @param {boolean} expanded
 * */
function handleArias(el, expanded) {
    if (expanded) {
        el.setAttribute('aria-expanded', 'true')
    } else {
        el.setAttribute('aria-expanded', 'false')
    }
}

/**
 * @param {ToggleBinding} binding
 * @param {boolean} enabled
 * */
function handleScroll(binding, enabled) {
    if (!binding.lockScroll) {
        return
    }

    if (enabled) {
        if (!binding.scrollRelease) {
            binding.scrollRelease = lockScroll()
        }

        return
    }

    if (binding.scrollRelease) {
        binding.scrollRelease()
        binding.scrollRelease = null
    }
}
