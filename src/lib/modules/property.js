import propertyAccess from '$lib/util/property-access'

/**
 * @type {ReturnType<typeof setInterval>}
 * */
let interval

/**
 * @param {NodeListOf<Element>} els - A collection of DOM elements.
 * */
export default els => {
    if (interval) {
        removeEventListener('resize', () => customProperties(els))
        removeEventListener('load', () => customProperties(els))
        clearInterval(interval)
    }

    addEventListener('resize', () => customProperties(els))
    addEventListener('load', () => customProperties(els))
    interval = setInterval(() => customProperties(els), 1000)

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
