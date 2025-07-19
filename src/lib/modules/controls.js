/**
 * @param {NodeListOf<Element>} els - A collection of DOM elements.
 * */
export default els => {
    for (const el of els) {
        if (el instanceof HTMLElement) {
            const target = el.dataset.controls
                ? document.querySelector(el.dataset.controls)
                : console.error('No target specified for controls', el.dataset)

            if (target instanceof HTMLMediaElement) {
                if (target.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) {
                    target.addEventListener('canplay', () => classes(el, target))
                } else {
                    classes(el, target)
                }

                el.addEventListener('click', () => {
                    target.paused ? target.play() : target.pause()
                    classes(el, target)
                })
            }
        }
    }
}

/**
 * @param {HTMLElement} el - The element to add classes to.
 * @param {HTMLMediaElement} target - The video element to check.
 * */
function classes(el, target) {
    if (target.paused) {
        el.classList.add('is-paused')
        el.classList.remove('is-playing')
    } else {
        el.classList.remove('is-paused')
        el.classList.add('is-playing')
    }
}
