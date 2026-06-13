import qs from 'qs'

const sort = (a: string, b: string): number => b.localeCompare(a)

const filter = (_: string, value: unknown): unknown => value || undefined

export function commit<T extends Record<PropertyKey, unknown>>(
    args: Partial<T>,
    callback: (args: Partial<T>) => void = () => undefined,
): void {
    const nextArgs = { ...retrieve(), ...args } as Partial<T>

    callback(nextArgs)

    const query = generate(nextArgs)

    if (query && window.location.search !== `?${query}`) {
        history.pushState(undefined, '', `${window.location.pathname}?${query}`)
    } else if (!query && window.location.search !== '') {
        history.pushState(undefined, '', window.location.pathname)
    }
}

export function generate(args: Record<PropertyKey, unknown>, prepend = ''): string {
    const queryString = qs
        .stringify(args, {
            sort,
            filter,
            encode: false,
            arrayFormat: 'brackets',
        })
        .replace(/\s+/g, '+')

    return queryString ? prepend + queryString : ''
}

export function retrieve(): Record<string, unknown> {
    const query = (window.location.search || '').replace(/^\?/, '')

    return qs.parse(query) as Record<string, unknown>
}
