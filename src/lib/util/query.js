import qs from 'qs'

/**
 * @param {string} a
 * @param {string} b
 * */
const sort = (a, b) => b.localeCompare(a)

/**
 * @param {string} _
 * @param {string} value
 * */
const filter = (_, value) => value || undefined

/** Updates the URL query string with the provided arguments.
 * @template {Record<PropertyKey, any>} T
 * @param {{ [K in keyof T]?: T[K] }} args - The arguments to update the query with.
 * @param {(args: Partial<T>) => void} callback - The callback function to execute after updating the query.
 * @returns {void}
 * */
export function commit(args, callback = () => undefined) {
    args = { ...retrieve(), ...args }

    callback(args)

    const query = generate(args)

    if (query) {
        history.pushState(undefined, '', `${window.location.pathname}?${query}`)
    } else if (window.location.search !== `?${query}`) {
        history.pushState(undefined, '', window.location.pathname)
    }
}

/**
 * @param {Record<PropertyKey, any>} args
 * @param {string} prepend
 * @returns {string}
 * */
export function generate(args, prepend = '') {
    const queryString = qs.stringify(args, {
        sort,
        filter,
        encode: false,
        arrayFormat: 'brackets',
    }).replace(/\s+/g, '+')

    return queryString
        ? prepend + queryString
        : ''
}

export function retrieve() {
    const query = (window.location.search || '').replace(/^\?/, '')

    return qs.parse(query)
}
