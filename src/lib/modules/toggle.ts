import { FocusableSchema } from '$lib/schemas/app'
import { ModuleSchema } from '$lib/schemas/core'
import { lockScroll } from '$lib/util/scroll-lock'

interface ToggleBinding {
    el: HTMLElement
    target: HTMLElement
    scrollRelease: (() => void) | null
    className: string
    lockScroll: boolean
    trapFocus: boolean
    required: boolean
}

const FOCUSABLE = 'a,button,input,select,textarea,[tabindex="0"]'

const collection = new Set<HTMLElement>()

export default ModuleSchema.implement(els => {
    const controllers = new Map<HTMLElement, AbortController>()
    const bindings: ToggleBinding[] = []
    const cleanups: Array<() => void> = []

    const listen = (
        target: EventTarget,
        type: string,
        listener: (event: Event) => void,
        options?: AddEventListenerOptions | boolean,
    ) => {
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

function getFocusableFor(target: HTMLElement) {
    return FocusableSchema.parse(Array.from(target.querySelectorAll<HTMLElement>(FOCUSABLE)))
}

function getTargetFor(el: HTMLElement) {
    const fallback = el.parentElement
    const prefered = el.dataset.toggleTarget ? document.querySelector<HTMLElement>(el.dataset.toggleTarget) : null

    if (prefered) {
        return prefered
    }

    if (fallback) {
        return fallback
    }

    throw new Error('No target found.', { cause: el })
}

function closeAll(bindings: ToggleBinding[], controllers: Map<HTMLElement, AbortController>, force = false) {
    for (const binding of bindings) {
        if (force || !binding.el.dataset.toggleScope) {
            closeToggle(binding, controllers, force)
        }
    }
}

function closeToggle(binding: ToggleBinding, controllers: Map<HTMLElement, AbortController>, force: boolean) {
    if (!force && binding.required) {
        return
    }

    handleTrapFocus(controllers, trapFocusHandler, false, [], binding.el)
    handleInertables(binding.target, true, binding.className)
    handleScroll(binding, false)
    handleArias(binding.el, false)
    binding.target.classList.remove(binding.className)
}

function openToggle(binding: ToggleBinding, controllers: Map<HTMLElement, AbortController>, focusable: HTMLElement[]) {
    handleTrapFocus(controllers, trapFocusHandler, binding.trapFocus, focusable, binding.el)
    handleInertables(binding.target, false, binding.className)
    handleScroll(binding, true)
    handleArias(binding.el, true)
    binding.target.classList.add(binding.className)
}

function handleInertables(target: HTMLElement, hide: boolean, className: string) {
    const inertables = target.querySelectorAll<HTMLElement>(`[data-toggle-inert="${className}"]`)

    for (const inertable of inertables) {
        if (hide) {
            inertable.setAttribute('inert', '')
        } else {
            inertable.removeAttribute('inert')
        }
    }
}

function handleTrapFocus(
    controllers: Map<HTMLElement, AbortController>,
    handler: (event: KeyboardEvent, focusable: HTMLElement[]) => void,
    enabled: boolean,
    focusable: HTMLElement[],
    el: HTMLElement,
) {
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

function trapFocusHandler(event: KeyboardEvent, focusable: HTMLElement[]) {
    if (event.code === 'Tab') {
        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (focusable.length === 1) {
            event.preventDefault()
        }

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

function handleArias(el: HTMLElement, expanded: boolean) {
    if (expanded) {
        el.setAttribute('aria-expanded', 'true')
    } else {
        el.setAttribute('aria-expanded', 'false')
    }
}

function handleScroll(binding: ToggleBinding, enabled: boolean) {
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
