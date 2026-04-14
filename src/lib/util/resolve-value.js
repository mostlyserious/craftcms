/**
 * @param {string} arg
 * */
function isJson(arg) {
    if (typeof arg !== 'string') {
        return false
    }

    try {
        const result = JSON.parse(arg)
        const type = Object.prototype.toString.call(result)

        return type === '[object Object]' || type === '[object Array]'
    } catch (_) {
        return false
    }
}

/**
 * @param {string} arg
 * */
function isInt(arg) {
    return arg !== '' && !isNaN(Number(arg)) && !arg.includes('.')
}

/**
 * @param {string} arg
 * */
function isFloat(arg) {
    return arg !== '' && !isNaN(Number(arg)) && arg.includes('.')
}

/**
 * @param {string} value
 * @returns {Array<unknown>|Record<string, unknown>|boolean|null|number|string|undefined}
 * */
export default function resolveValue(value) {
    switch (value) {
        case 'true':
            return true
        case 'false':
            return false
        case 'null':
            return null
        case 'undefined':
            return undefined
    }

    switch (true) {
        case isInt(value):
            return parseInt(value, 10)
        case isFloat(value):
            return parseFloat(value)
        case isJson(value):
            return /** @type {Array<unknown>|Record<string, unknown>} */ (JSON.parse(value))
        default:
            return value
    }
}
