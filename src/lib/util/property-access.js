/** Navigates through an object using a string path and returns the value at the end of the path.
 * @param {unknown} obj - The object to navigate through.
 * @param {string} path - A dot-separated string representing the path to navigate.
 * @returns {unknown} The value found at the end of the path, or undefined if not found.
 * */
export default function propertyAccess(obj, path) {
    if (!path) {
        return undefined
    }

    let current = obj

    for (const part of path.split('.')) {
        if (part === 'computedStyle' && current instanceof Element) {
            current = getComputedStyle(current)
            continue
        }

        if (!current || (typeof current !== 'object' && typeof current !== 'function')) {
            return undefined
        }

        current = Reflect.get(current, part)
    }

    return current
}
