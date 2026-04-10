/**
 * @typedef {Object} ScrollLockSnapshot
 * @property {Record<string, string>} body
 * @property {Record<string, string>} html
 * @property {number} x
 * @property {number} y
 * */

const HTML_STYLE_KEYS = [ 'overflow' ]
const BODY_STYLE_KEYS = [ 'overflow', 'position', 'top', 'left', 'right', 'width' ]

let lockCount = 0
/** @type {?ScrollLockSnapshot} */
let snapshot = null

/**
 * @param {HTMLElement} el
 * @param {string[]} keys
 * @returns {Record<string, string>}
 * */
function captureStyles(el, keys) {
    /** @type {Record<string, string>} */
    const styles = {}

    for (const key of keys) {
        styles[key] = el.style.getPropertyValue(key)
    }

    return styles
}

/**
 * @param {HTMLElement} el
 * @param {Record<string, string>} styles
 * */
function restoreStyles(el, styles) {
    for (const [ key, value ] of Object.entries(styles)) {
        if (value) {
            el.style.setProperty(key, value)
        } else {
            el.style.removeProperty(key)
        }
    }
}

/**
 * @returns {() => void}
 * */
export function lockScroll() {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
        return () => {}
    }

    const html = document.documentElement
    const body = document.body

    if (!html || !body) {
        return () => {}
    }

    if (lockCount === 0) {
        snapshot = {
            html: captureStyles(html, HTML_STYLE_KEYS),
            body: captureStyles(body, BODY_STYLE_KEYS),
            x: window.scrollX,
            y: window.scrollY,
        }

        html.style.overflow = 'hidden'
        body.style.overflow = 'hidden'
        body.style.position = 'fixed'
        body.style.top = `-${snapshot.y}px`
        body.style.left = '0'
        body.style.right = '0'
        body.style.width = '100%'
    }

    lockCount += 1

    let released = false

    return () => {
        if (released || lockCount === 0) {
            return
        }

        released = true
        lockCount -= 1

        if (lockCount > 0 || !snapshot) {
            return
        }

        restoreStyles(html, snapshot.html)
        restoreStyles(body, snapshot.body)
        window.scrollTo(snapshot.x, snapshot.y)
        snapshot = null
    }
}
