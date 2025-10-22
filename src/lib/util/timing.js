/**
 * Creates a throttle function that ensures functions passed to it are not called more than once within a specified duration.
 * All functions passed to the returned throttle function share the same timing constraint.
 * @param {number} wait - The duration (in milliseconds) to wait before allowing another function call.
 * @returns {<F extends () => any>(func: F) => void} A throttle function that preserves the return type
 */
export function useThrottle(wait) {
    let lastCall = 0

    return func => {
        const now = Date.now()

        if (now - lastCall >= wait) {
            lastCall = now
            func()
        }
    }
}

/**
 * Creates a debounce function that delays execution until after a wait period has elapsed since the last call.
 * All functions passed to the returned debounce function share the same timing constraint.
 * @param {number} wait - The duration (in milliseconds) to wait before executing the function.
 * @returns {<F extends () => any>(func: F) => void} A debounce function that executes after the wait period
 */
export function useDebounce(wait) {
    /** @type {?number} */
    let timeout = null

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
