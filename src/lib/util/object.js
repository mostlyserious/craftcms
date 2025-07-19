/**
* @template {object} T
* @param {T} object
* @returns {Array<[ keyof T, T[keyof T] ]>}
* */
export function entries(object) { // @ts-ignore
    return Object.entries(object)
}

/**
* @template {object} T
* @param {T} object
* @returns {Array<keyof T>}
* */
export function keys(object) { // @ts-ignore
    return Object.keys(object)
}

/**
* @template {object} T
* @param {T} object
* @returns {Array<T[keyof T]>}
* */
export function values(object) { // @ts-ignore
    return Object.values(object)
}
