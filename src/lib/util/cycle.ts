export function next(i: number, end: number): number {
    let n = i + 1

    if (n >= end) {
        return 0
    }

    return n
}

export function prev(i: number, end: number): number {
    let n = i - 1

    if (n <= -1) {
        return end - 1
    }

    return n
}
