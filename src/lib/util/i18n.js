import { craft } from '$lib/stores/global'
import propertyAccess from '$lib/util/property-access'

/** Formats a string by replacing tokens with their corresponding values.
 * @param {string} string - The string to format.
 * @param {Record<PropertyKey, unknown>} tokens - An object containing token-value pairs.
 * @returns {string} - The formatted string.
 * */
export const format = (string, tokens = {}) => {
    return string.replace(/{([\w\d.]+)}/g, (match, token) => {
        const resolved = propertyAccess(tokens, token)

        return resolved !== undefined ? String(resolved) : match
    })
}

/** Translates a string into the current language if a translation exists.
 * @param {string} str - The string to translate.
 * @param {Record<PropertyKey, unknown>} [tokens={}] - An object containing token-value pairs for formatting.
 * @returns {string} - The translated (and possibly formatted) string.
 * */
export const t = (str, tokens = {}) => {
    if (!craft.i18n || typeof craft.i18n[str] === 'undefined') {
        return format(str, tokens)
    }

    return format(craft.i18n[str], tokens)
}

/** Formats a number into a localized string representation.
 * @param {number} details - A number.
 * @param {Intl.NumberFormatOptions} args - Formatting options.
 * @returns {string} - The localized number string.
 * */
export const number = (details, args = {}) => {
    return new Intl.NumberFormat(craft.lang, args).format(details)
}

/** Formats a date into a localized string representation.
 * @param {string|number} details - The date details (can be a string or a timestamp).
 * @param {Intl.DateTimeFormatOptions} args - Formatting options.
 * @returns {string} - The localized date string.
 * */
export const date = (details, args = {}) => {
    return new Date(details).toLocaleDateString(craft.lang, args)
}

/** Formats a time into a localized string representation.
 * @param {string|number} details - The time details (can be a string or a timestamp).
 * @param {Intl.DateTimeFormatOptions} args - Formatting options.
 * @returns {string} - The localized time string.
 * */
export const time = (details, args = {}) => {
    return new Date(details).toLocaleTimeString(craft.lang, args)
}
