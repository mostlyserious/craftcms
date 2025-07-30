import { scroll } from 'motion'

/**
 * @param {NodeListOf<Element>} els - A collection of DOM elements.
 * */
export default els => {
    for (const el of els) {
        if (el instanceof HTMLElement) {
            scroll(/** @param {number} progress */ progress => {
                const control = progress * 2 - 1

                el.style.setProperty('--parallax-control', control.toFixed(4))
            }, {
                target: el,
                offset: [ 'start end', 'end start' ],
            })
        }
    }
}
