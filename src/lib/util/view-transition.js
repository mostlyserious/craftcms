/**
 * @template {Function} T
 * @param {T} handler
 * @param {Array<unknown>} args
 * @return {Promise<ReturnType<T>>}
 * */
function closure(handler, ...args) {
    return new Promise(resolve => {
        if (!document.startViewTransition) {
            resolve(handler(...args))

            return
        }

        document.startViewTransition(() => {
            resolve(handler(...args))
        })
    })
}

/**
 * @template {Function} T
 * @param {T} handler
 * @param {Array<unknown>} args [description]
 * @return {() => Promise<ReturnType<T>>}
 * */
function viewTransitionClosure(handler, ...args) {
    return () => closure(handler, ...args)
}

/**
 * @template {Function} T
 * @param {T} handler
 * @param {Array<unknown>} args [description]
 * @return {Promise<ReturnType<T>>}
 * */
function viewTransition(handler, ...args) {
    return closure(handler, ...args)
}

export { viewTransitionClosure }

export default viewTransition
