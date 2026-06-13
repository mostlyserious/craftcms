import { ModuleSchema } from '$lib/schemas/core'

type MeasuredRect = Pick<DOMRect, 'top' | 'height'>

export default ModuleSchema.implement(els => {
    const cleanups: Array<() => void> = []
    const resizeObserver = new ResizeObserver(() => {
        for (const el of els) {
            syncElement(el)
        }
    })
    const handleScroll = () => {
        for (const el of els) {
            syncElement(el)
        }
    }

    cleanups.push(() => resizeObserver.disconnect())
    cleanups.push(listen(window, 'resize', handleScroll))
    cleanups.push(listen(window, 'scroll', handleScroll, { passive: true }))

    for (const el of els) {
        resizeObserver.observe(el)
        syncElement(el)
    }

    return () => {
        for (const cleanup of cleanups.reverse()) {
            cleanup()
        }

        for (const el of els) {
            el.style.removeProperty('--parallax-control')
            el.style.removeProperty('--parallax-offset')
        }
    }
})

function listen<K extends keyof WindowEventMap>(
    target: Window,
    type: K,
    listener: (event: WindowEventMap[K]) => void,
    options?: AddEventListenerOptions,
) {
    target.addEventListener(type, listener, options)

    return () => target.removeEventListener(type, listener, options)
}

function syncElement(el: HTMLElement) {
    const rect = el.getBoundingClientRect()
    const distance = resolveParallaxDistance(el, rect.height)

    el.style.setProperty(
        '--parallax-control',
        measureLiveControlFromRect(rect, window.innerHeight, distance).toFixed(4),
    )
    el.style.setProperty(
        '--parallax-offset',
        measureBaselineControlFromRect(rect, window.innerHeight, window.scrollY, distance).toFixed(4),
    )
}

function resolveParallaxDistance(el: HTMLElement, fallbackDistance: number) {
    const rawDistance = el.dataset.parallaxDistance
    const distance = rawDistance ? Number.parseFloat(rawDistance) : Number.NaN

    return Number.isFinite(distance) && distance > 0 ? distance : fallbackDistance
}

export function measureLiveControlFromRect(
    rect: DOMRect | MeasuredRect,
    viewportHeight: number,
    distance = rect.height,
): number {
    return measureControlFromTop(rect.top, distance, viewportHeight)
}

export function measureBaselineControlFromRect(
    rect: DOMRect | MeasuredRect,
    viewportHeight: number,
    scrollY: number,
    distance = rect.height,
): number {
    return measureControlFromTop(rect.top + scrollY, distance, viewportHeight)
}

function measureControlFromTop(top: number, height: number, viewportHeight: number) {
    const progress = Math.min(Math.max((viewportHeight - top) / (viewportHeight + height), 0), 1)

    return progress * 2 - 1
}
