export default function focusTrap(el: HTMLElement): () => void {
    const focusable = el.querySelectorAll<HTMLElement>(
        ':any-link, iframe, button, input, select, textarea, [tabindex="0"]',
    )

    addEventListener('keydown', onKeydown)
    addEventListener('keyup', onKeyup)

    function onKeydown(event: KeyboardEvent): void {
        if (event.code === 'Tab') {
            if (focusable.length === 1) {
                event.preventDefault()
            }

            if (event.shiftKey) {
                if (document.activeElement === focusable[0]) {
                    event.preventDefault()
                    focusable[focusable.length - 1]?.focus()
                }
            } else if (document.activeElement === focusable[focusable.length - 1]) {
                event.preventDefault()
                focusable[0]?.focus()
            }
        }
    }

    function onKeyup(event: KeyboardEvent): void {
        if (event.code === 'Tab' && !el.contains(document.activeElement)) {
            event.preventDefault()
            focusable[0]?.focus()
        }
    }

    return () => {
        removeEventListener('keydown', onKeydown)
        removeEventListener('keyup', onKeyup)
    }
}
