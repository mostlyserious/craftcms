interface ScrollLockSnapshot {
    body: Record<string, string>
    html: Record<string, string>
    x: number
    y: number
}

const HTML_STYLE_KEYS = ['overflow']
const BODY_STYLE_KEYS = ['overflow', 'position', 'top', 'left', 'right', 'width']

let lockCount = 0
let snapshot: ScrollLockSnapshot | null = null

function captureStyles(el: HTMLElement, keys: string[]): Record<string, string> {
    const styles: Record<string, string> = {}

    for (const key of keys) {
        styles[key] = el.style.getPropertyValue(key)
    }

    return styles
}

function restoreStyles(el: HTMLElement, styles: Record<string, string>): void {
    for (const [key, value] of Object.entries(styles)) {
        if (value) {
            el.style.setProperty(key, value)
        } else {
            el.style.removeProperty(key)
        }
    }
}

export function lockScroll(): () => void {
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
