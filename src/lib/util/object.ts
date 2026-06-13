export function entries<T extends object>(object: T): Array<[keyof T, T[keyof T]]> {
    return Object.entries(object) as Array<[keyof T, T[keyof T]]>
}

export function keys<T extends object>(object: T): Array<keyof T> {
    return Object.keys(object) as Array<keyof T>
}

export function values<T extends object>(object: T): Array<T[keyof T]> {
    return Object.values(object) as Array<T[keyof T]>
}
