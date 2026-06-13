function isJson(arg: string) {
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

function isInt(arg: string) {
    return arg !== '' && !isNaN(Number(arg)) && !arg.includes('.')
}

function isFloat(arg: string) {
    return arg !== '' && !isNaN(Number(arg)) && arg.includes('.')
}

export default function resolveValue(value: string): unknown {
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
            return JSON.parse(value)
        default:
            return value
    }
}
