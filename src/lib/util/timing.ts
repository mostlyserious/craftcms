export function useThrottle(wait: number): <F extends () => unknown>(func: F) => void {
    let lastCall = 0

    return func => {
        const now = Date.now()

        if (now - lastCall >= wait) {
            lastCall = now
            func()
        }
    }
}

export function useDebounce(wait: number): <F extends () => unknown>(func: F) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null

    return func => {
        if (timeout !== null) {
            clearTimeout(timeout)
        }

        timeout = setTimeout(() => {
            timeout = null
            func()
        }, wait)
    }
}
