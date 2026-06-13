export default function propertyAccess(obj: unknown, path: string): unknown {
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
