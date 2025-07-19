const FOCUSABLE = 'a,button,input,select,textarea,[tabindex="0"]'

/**
 * @param {NodeListOf<Element>} els - A collection of DOM elements.
 * */
export default els => {
    document.body.addEventListener('click', () => closeAll(els))

    addEventListener('keydown', ({ code }) => {
        if (code === 'Escape') {
            closeAll(els)
        }
    })

    for (const el of els) {
        if (el instanceof HTMLElement) {
            const target = getTargetFor(el)
            const lockScroll = el.dataset.toggleLockScroll !== undefined
            const trapFocus = el.dataset.toggleTrapFocus !== undefined
            const required = el.dataset.toggleRequired !== undefined
            const className = el.dataset.toggle
                ? el.dataset.toggle
                : 'is-active'

            target.addEventListener('click', event => {
                for (const node of getFocusableFor(target)) {
                    if (event.target instanceof Node) {
                        if (node.isSameNode(event.target)) {
                            return
                        }
                    }
                }

                event.stopPropagation()
            })

            handleArias(el, target.classList.contains(className))
            handleInertables(target, !target.classList.contains(className), className)

            el.addEventListener('click', event => {
                const focusable = getFocusableFor(target)

                focusable.unshift(el)
                event.stopPropagation()

                for (const elB of els) {
                    if (elB instanceof HTMLElement) {
                        const targetB = getTargetFor(elB)
                        const { toggleGroup: toggleGroupA } = el.dataset
                        const { toggleGroup: toggleGroupB } = elB.dataset
                        const { toggleScope: toggleScopeA } = el.dataset
                        const { toggleScope: toggleScopeB } = elB.dataset

                        if (!targetB.isSameNode(target)
                            && (!toggleGroupA || toggleGroupB !== toggleGroupA)
                            && (!toggleScopeB || toggleScopeB === toggleScopeA)) {
                            targetB.classList.remove(className)
                            handleArias(elB, false)
                            handleInertables(targetB, true, className)
                        }
                    }
                }

                if (target.classList.contains(className)) {
                    if (!required) {
                        handleTrapFocus(trapFocusHandler, false, focusable)
                        handleInertables(target, true, className)
                        handleScroll(lockScroll, 'auto')
                        handleArias(el, false)
                        target.classList.remove(className)
                    }
                } else {
                    handleTrapFocus(trapFocusHandler, trapFocus, focusable)
                    handleInertables(target, false, className)
                    handleScroll(lockScroll, 'hidden')
                    handleArias(el, true)
                    target.classList.add(className)
                }
            })
        }
    }
}

/**
 * @param {HTMLElement} target
 * @returns {Array<Element>}
 * */
function getFocusableFor(target) {
    return target ? Array.from(target.querySelectorAll(FOCUSABLE)) : []
}

/**
 * @param {HTMLElement} el - The element to get the target for.
 * @returns {HTMLElement} - The target element or null.
 * */
function getTargetFor(el) {
    const fallback = el.parentElement
    /** @type {?HTMLElement} */
    const prefered = el.dataset.toggleTarget
        ? document.querySelector(el.dataset.toggleTarget)
        : null

    if (prefered) {
        return prefered
    }

    if (fallback) {
        return fallback
    }

    throw new Error('No target found.', { cause: el })
}

/**
 * @param {NodeListOf<Element>} els
 * @returns {void}
 * */
function closeAll(els) {
    for (const el of els) {
        if (el instanceof HTMLElement && !el.dataset.toggleScope) {
            const target = getTargetFor(el)
            const lockScroll = el.dataset.toggleLockScroll !== undefined
            const required = el.dataset.toggleRequired !== undefined
            const className = el.dataset.toggle
                ? el.dataset.toggle
                : 'is-active'

            if (!required) {
                target.classList.remove(className)
                handleArias(el, false)
                handleScroll(lockScroll, 'auto')
                handleInertables(target, true, className)
            }
        }
    }
}

/**
 * @param {HTMLElement} target
 * @param {boolean} hide
 * @param {string} className
 * @returns {void}
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
 * @param {(event: KeyboardEvent, focusable: Element[]) => void} handler
 * @param {boolean} enabled
 * @param {Element[]} focusable
 * */
function handleTrapFocus(handler, enabled, focusable) {
    if (enabled) {
        addEventListener('keydown', event => handler(event, focusable))
    } else {
        removeEventListener('keydown', event => handler(event, focusable))
    }
}

/**
 * @param {KeyboardEvent} event
 * @param {Element[]} focusable
 * */
function trapFocusHandler(event, focusable) {
    if (event.code === 'Tab') {
        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (focusable.length === 1) {
            event.preventDefault()
        }

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
 * @param {boolean} lockScroll
 * @param {'auto'|'hidden'} value
 * */
function handleScroll(lockScroll, value) {
    if (lockScroll) {
        document.body.style.overflow = value
    }
}
