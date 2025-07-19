/**
 * @param {number} i
 * @param {number} end
 * */
export function next(i, end) {
    let n = i + 1

    if (n >= end) {
        return 0
    }

    return n
}

/**
 * @param {number} i
 * @param {number} end
 * */
export function prev(i, end) {
    let n = i - 1

    if (n <= -1) {
        return end - 1
    }

    return n
}
