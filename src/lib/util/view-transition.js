/**
 * @template {(...args: unknown[]) => unknown} T
 * @param {T} handler
 * @param {Parameters<T>} args [description]
 * @return {() => Promise<ReturnType<T>>}
 * */
export function viewTransitionClosure(handler, ...args) {
    return () => closure(handler, ...args)
}

/**
 * @template {(...args: unknown[]) => unknown} T
 * @param {T} handler
 * @param {Parameters<T>} args [description]
 * @return {Promise<ReturnType<T>>}
 * */
export function viewTransition(handler, ...args) {
    return closure(handler, ...args)
}

/**
 * @template {(...args: unknown[]) => unknown} T
 * @param {T} handler
 * @param {Parameters<T>} args
 * @return {Promise<ReturnType<T>>}
 * */
function closure(handler, ...args) {
    return new Promise(resolve => {
        if (!document.startViewTransition) {
            resolve(/** @type {ReturnType<T>} */ (handler(...args)))

            return
        }

        document.startViewTransition(async () => {
            resolve(/** @type {ReturnType<T>} */ (await handler(...args)))
        })
    })
}
