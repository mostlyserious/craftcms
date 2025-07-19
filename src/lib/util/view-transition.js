/**
 * @template {Function} T
 * @param {T} handler
 * @param {Array<any>} args
 * @return {Promise<ReturnType<T>>}
 * */
function closure(handler, ...args) {
    return new Promise(async resolve => {
        if (!document.startViewTransition) {
            resolve(await handler(...args))

            return
        }

        document.startViewTransition(async () => {
            resolve(await handler(...args))
        })
    })
}

/**
 * @template {Function} T
 * @param {T} handler
 * @param {Array<any>} args [description]
 * @return {() => Promise<ReturnType<T>>}
 * */
function viewTransitionClosure(handler, ...args) {
    return () => closure(handler, ...args)
}

/**
 * @template {Function} T
 * @param {T} handler
 * @param {Array<any>} args [description]
 * @return {Promise<ReturnType<T>>}
 * */
function viewTransition(handler, ...args) {
    return closure(handler, ...args)
}

export { viewTransitionClosure }

export default viewTransition
