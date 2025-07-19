import { hash } from 'ohash'

/**
 * @type {Record<PropertyKey, number>}
 * */
const records = {}

/** A throttling function that ensures a given function is not called more than once within a specified duration.
 * @template {Array<unknown>} T
 * @template {(...args: T) => any} F
 * @param {F} func - The function to throttle.
 * @param {number} wait - The duration (in milliseconds) to wait before allowing the function to be called again.
 * @param {T} args - Arguments to pass to the function when it's called.
 * @returns {F} - Returns a new function if 'prepare' is passed as the only argument, otherwise it calls the function directly.
 * */
export default function throttle(func, wait, ...args) {
    const key = hash(func)

    const queue = /** @type {F} */ ((...args) => {
        const now = Date.now()

        if (records[key]) {
            if (records[key] + wait < now) {
                records[key] = now

                return func(...args)
            }
        } else {
            records[key] = now

            return func(...args)
        }
    })

    if (!args.length || args[0] !== 'prepare') {
        queue(...args)
    }

    return queue
}
