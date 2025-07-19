/** Navigates through an object using a string path and returns the value at the end of the path.
 * @param {Record<PropertyKey, any>} obj - The object to navigate through.
 * @param {string} path - A dot-separated string representing the path to navigate.
 * @returns {any} The value found at the end of the path, or undefined if not found.
 * */
export default function propertyAccess(obj, path) {
    if (!path) {
        return undefined
    }

    const parts = path.split('.')
    const len = parts.length

    for (let i = 0; i < len; i++) {
        if (parts[i] === 'computedStyle' && obj instanceof Element) {
            obj = getComputedStyle(obj)
        } else if (obj) {
            obj = obj[parts[i]]
        } else {
            return undefined
        }
    }

    return obj
}
