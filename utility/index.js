/**
 * @param {string} path
 * @returns {string}
 */
export function toBasePath(path) {
    return `${path}`.replace(/^\/+|\/+$/g, '')
}
