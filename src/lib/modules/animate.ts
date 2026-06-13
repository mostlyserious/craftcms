import { animate as motionAnimate, inView, type DOMKeyframesDefinition } from 'motion'
import { EasingSchema } from '$lib/schemas/app'
import { ModuleSchema } from '$lib/schemas/core'
import { screen } from '$lib/stores/global'
import resolveValue from '$lib/util/resolve-value'

type KeyframePrimitive = string | number
type KeyframeValue = KeyframePrimitive | KeyframePrimitive[]
type Keyframes = Record<string, KeyframeValue>

const TRANSFORM_REST_VALUES = new Map<string, number>([
    ['transformPerspective', 0],
    ['x', 0],
    ['y', 0],
    ['z', 0],
    ['translateX', 0],
    ['translateY', 0],
    ['translateZ', 0],
    ['scale', 1],
    ['scaleX', 1],
    ['scaleY', 1],
    ['scaleZ', 1],
    ['rotate', 0],
    ['rotateX', 0],
    ['rotateY', 0],
    ['rotateZ', 0],
    ['skew', 0],
    ['skewX', 0],
    ['skewY', 0],
])

export default ModuleSchema.implement((els: NodeListOf<HTMLElement>) => {
    const cleanups: Array<() => void> = []

    for (const el of els) {
        if (typeof el.dataset.animate !== 'string') {
            continue
        }

        const keyframes = resolveDatasetKeyframes(el)
        const animation = motionAnimate(
            el,
            screen.prefersReducedMotion.current ? { opacity: keyframes.opacity } : keyframes,
            {
                ease: EasingSchema.parse(el.dataset.animateEase || 'easeInOut'),
                delay: (Number.parseInt(el.dataset.animateDelay || '', 10) || 0) / 1000,
                duration: (Number.parseInt(el.dataset.animateDuration || '', 10) || 300) / 1000,
            },
        )

        let removeLoadListener: (() => void) | null = null

        animation.pause()

        const stopWatching = inView(
            el,
            () => {
                if (el instanceof HTMLImageElement) {
                    if (el.complete) {
                        animation.play()
                    } else {
                        const playOnLoad = () => animation.play()

                        el.addEventListener('load', playOnLoad, { once: true })
                        removeLoadListener = () => el.removeEventListener('load', playOnLoad)
                    }
                } else {
                    animation.play()
                }

                return el.dataset.animateRepeat === ''
                    ? () => {
                          animation.cancel()
                          animation.play()
                          animation.pause()
                      }
                    : undefined
            },
            {
                margin: '0px -60px',
            },
        )

        cleanups.push(() => {
            removeLoadListener?.()
            stopWatching()
            animation.cancel()
        })
    }

    return () => {
        for (const cleanup of cleanups.reverse()) {
            cleanup()
        }
    }
})

export function resolveDatasetKeyframes(el: HTMLElement): DOMKeyframesDefinition {
    const keyframes: Keyframes = {}
    const properties = (el.dataset.animate || '')
        .split(';')
        .map(value => value.trim())
        .filter(Boolean)

    for (const property of properties) {
        const [prop, valueString] = property.split(':').map(value => value.trim())

        if (!prop || !valueString) {
            continue
        }

        const resolvedValues = valueString
            .split(',')
            .map(value => resolveValue(value))
            .filter(isKeyframePrimitive)

        if (!resolvedValues.length) {
            continue
        }

        keyframes[prop] = resolvedValues.length === 1 ? resolveKeyframeValue(prop, resolvedValues[0]) : resolvedValues
    }

    if (!Object.hasOwn(keyframes, 'opacity')) {
        keyframes.opacity = [0, resolveOpacity(el)]
    }

    return keyframes as DOMKeyframesDefinition
}

export function resolveKeyframeValue(key: string, value: KeyframeValue): KeyframeValue {
    const rest = TRANSFORM_REST_VALUES.get(key)

    if (rest === undefined || Array.isArray(value) || value === null) {
        return value
    }

    return [value, rest]
}

export function resolveOpacity(el: Element): number {
    if (typeof getComputedStyle !== 'function') {
        return 1
    }

    const style = getComputedStyle(el)
    const opacity = Number.parseFloat(style.opacity)

    return Number.isFinite(opacity) && style.visibility !== 'hidden' && opacity !== 0 ? opacity : 1
}

function isKeyframePrimitive(value: unknown): value is KeyframePrimitive {
    return typeof value === 'string' || typeof value === 'number'
}
