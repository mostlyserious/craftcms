/**
 * @param {string} path
 * @returns {string}
 * */
export function toBasePath(path: string): string {
    return `${path}`.replace(/^\/+|\/+$/g, '')
}
