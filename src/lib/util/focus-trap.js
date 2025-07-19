/**
 * @param {HTMLElement} el
 * @returns {() => void} Callback to untrap focus
 * */
export default function focusTrap(el) {
    /** @type {NodeListOf<HTMLElement>} el */
    const focusable = el.querySelectorAll(':any-link, iframe, button, input, select, textarea, [tabindex="0"]')

    addEventListener('keydown', onKeydown)
    addEventListener('keyup', onKeyup)

    /** @param {KeyboardEvent} event */
    function onKeydown(event) {
        if (event.code === 'Tab') {
            if (focusable.length === 1) {
                event.preventDefault()
            }

            if (event.shiftKey) {
                if (document.activeElement === focusable[0]) {
                    event.preventDefault()
                    focusable[focusable.length - 1].focus()
                }
            } else if (document.activeElement === focusable[focusable.length - 1]) {
                event.preventDefault()
                focusable[0].focus()
            }
        }
    }

    /** @param {KeyboardEvent} event */
    function onKeyup(event) {
        if (event.code === 'Tab' && !el.contains(document.activeElement)) {
            event.preventDefault()
            focusable[0].focus()
        }
    }

    return () => {
        removeEventListener('keydown', onKeydown)
        removeEventListener('keyup', onKeyup)
    }
}
