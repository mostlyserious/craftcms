import { craft } from '$lib/stores/global'
import propertyAccess from '$lib/util/property-access'

export const format = (string: string, tokens: Record<PropertyKey, unknown> = {}): string => {
    return string.replace(/{([\w\d.]+)}/g, (match, token) => {
        const resolved = propertyAccess(tokens, token)

        return resolved !== undefined ? String(resolved) : match
    })
}

export const t = (str: string, tokens: Record<PropertyKey, unknown> = {}): string => {
    if (!craft.i18n || typeof craft.i18n[str] === 'undefined') {
        return format(str, tokens)
    }

    return format(craft.i18n[str], tokens)
}

export const number = (details: number, args: Intl.NumberFormatOptions = {}): string => {
    return new Intl.NumberFormat(craft.lang, args).format(details)
}

export const date = (details: string | number, args: Intl.DateTimeFormatOptions = {}): string => {
    return new Date(details).toLocaleDateString(craft.lang, args)
}

export const time = (details: string | number, args: Intl.DateTimeFormatOptions = {}): string => {
    return new Date(details).toLocaleTimeString(craft.lang, args)
}
