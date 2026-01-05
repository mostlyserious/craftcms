import propertyAccess from '$lib/util/property-access'

/**
 * @type {WeakMap<NodeListOf<Element>, { resizeObserver: ResizeObserver, mutationObserver: MutationObserver }>}
 * */
const observers = new WeakMap()

/**
 * @param {NodeListOf<Element>} els - A collection of DOM elements.
 * */
export default els => {
    const existing = observers.get(els)

    if (existing) {
        existing.resizeObserver.disconnect()
        existing.mutationObserver.disconnect()
    }

    const resizeObserver = new ResizeObserver(() => customProperties(els))
    const mutationObserver = new MutationObserver(() => customProperties(els))

    for (const el of els) {
        if (el instanceof HTMLElement) {
            resizeObserver.observe(el)
            mutationObserver.observe(el, {
                attributes: true,
                attributeFilter: [ 'data-property', 'data-property-scoped' ],
                childList: false,
                subtree: false,
            })
        }
    }

    observers.set(els, { resizeObserver, mutationObserver })

    customProperties(els)
}

/**
 * @param {NodeListOf<Element>} els - A collection of DOM elements.
 * */
function customProperties(els) {
    for (const el of els) {
        if (el instanceof HTMLElement) {
            const scoped = 'propertyScoped' in el.dataset
            const properties = el.dataset.property
                ? el.dataset.property.split(';').map(p => p.trim()).filter(Boolean)
                : []

            for (const property of properties) {
                const args = property.trim()

                let target = document.documentElement
                let value = null
                let prop = ''
                let unit = ''
                let key = ''

                ;[ prop, key = '' ] = args.split(':').map(str => str.trim())
                ;[ key, unit = '' ] = key.split('|').map(str => str.trim())

                value = propertyAccess(el, key)

                if (scoped) {
                    target = el.dataset.propertyScoped === 'parent'
                        ? el.parentElement || el
                        : el
                }

                if (typeof value === 'string' || typeof value === 'number') {
                    target.style.setProperty(prop, `${value}${unit}`)
                } else {
                    console.warn('Invalid property value:', value)
                }
            }
        }
    }
}
