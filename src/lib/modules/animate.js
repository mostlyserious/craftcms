import * as z from 'zod/mini'
import { inView } from 'motion'
import { animate } from 'motion/mini'
import { $screen } from '$lib/stores/global'
import resolveValue from '$lib/util/resolve-value'

const EasingSchema = z.enum([
    'linear',
    'easeIn',
    'easeOut',
    'easeInOut',
    'circIn',
    'circOut',
    'circInOut',
    'backIn',
    'backOut',
    'backInOut',
    'anticipate',
])

/**
 * IMPORTANT: if you want to use `x` or `y` translate values on animations, you will
 * need to import the `animate()` function from 'motion' instead of 'motion/mini'
 * @param {NodeListOf<Element>} els - A collection of DOM elements.
 * */
export default els => {
    for (const el of els) {
        if ((el instanceof HTMLElement || el instanceof SVGElement) && typeof el.dataset.animate === 'string') {
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

            const animation = animate(el, $screen.prefersReducedMotion.current ? { opacity: args.opacity } : args, {
                ease: EasingSchema.parse(el.dataset.animateEase || 'easeInOut'),
                delay: (parseInt(el.dataset.animateDelay || '') || 0) / 1000,
                duration: (parseInt(el.dataset.animateDuration || '') || 300) / 1000,
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
                margin: '0px -60px',
            })
        }
    }
}
