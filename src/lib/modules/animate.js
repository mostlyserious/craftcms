import { inView } from 'motion'
import { animate } from 'motion/mini'
import resolveValue from '$lib/util/resolve-value'

/**
 * @param {NodeListOf<Element>} els - A collection of DOM elements.
 * */
export default els => {
    for (const el of els) {
        if (el instanceof HTMLElement && typeof el.dataset.animate === 'string') {
            /** @type {Record<string,Array<string|number>>} */
            const args = {}
            const properties = el.dataset.animate.split(';').map(s => s.trim()).filter(Boolean)
            const propertyEntries = properties.map(p => p.split(':').map(s => s.trim())).filter(Boolean)

            for (const [ prop, valueString ] of propertyEntries) {
                const valueArray = valueString.split(',')

                valueArray[1] = valueArray[1] || '0'
                args[prop] = valueArray.map(resolveValue)
            }

            if (!args.opacity) {
                args.opacity = [ 0, 1 ]
            }

            const animation = animate(el, args, {
                // @ts-ignore
                ease: el.dataset.animateEase || 'easeInOut',
                delay: parseFloat(el.dataset.animateDelay || '') || 0,
                duration: parseFloat(el.dataset.animateDuration || '') || 0.3,
            })

            animation.pause()

            inView(el, () => {
                if (el instanceof HTMLImageElement) {
                    if (el.complete) {
                        animation.play()
                    } else {
                        el.addEventListener('load', () => animation.play())
                    }
                } else {
                    animation.play()
                }

                return el.dataset.animateRepeat === '' ? () => {
                    animation.cancel()
                    animation.play()
                    animation.pause()
                } : undefined
            }, {
                margin: '0px 0px -60px',
            })
        }
    }
}
