import propertyAccess from '$lib/util/property-access'

const { i18n, lang } = window.$app

/** Formats a string by replacing tokens with their corresponding values.
 * @param {string} string - The string to format.
 * @param {Record<PropertyKey, any>} tokens - An object containing token-value pairs.
 * @returns {string} - The formatted string.
 * */
export const format = (string, tokens = {}) => {
    return string.replace(/{([\w\d.]+)}/g, (match, token) => {
        return propertyAccess(tokens, token) !== undefined
            ? String(propertyAccess(tokens, token))
            : match
    })
}

/** Translates a string into the current language if a translation exists.
 * @param {string} str - The string to translate.
 * @param {Record<PropertyKey, string|number>} [tokens={}] - An object containing token-value pairs for formatting.
 * @returns {string} - The translated (and possibly formatted) string.
 * */
export const t = (str, tokens = {}) => {
    if (typeof i18n === 'undefined' || typeof i18n[str] === 'undefined') {
        return format(str, tokens)
    }

    return format(i18n[str], tokens)
}

/** Formats a number into a localized string representation.
 * @param {number} details - A number.
 * @param {Intl.NumberFormatOptions} args - Formatting options.
 * @returns {string} - The localized number string.
 * */
export const number = (details, args = {}) => {
    return new Intl.NumberFormat(lang, args).format(details)
}

/** Formats a date into a localized string representation.
 * @param {string|number} details - The date details (can be a string or a timestamp).
 * @param {Intl.DateTimeFormatOptions} args - Formatting options.
 * @returns {string} - The localized date string.
 * */
export const date = (details, args = {}) => {
    return new Date(details).toLocaleDateString(lang, args)
}

/** Formats a time into a localized string representation.
 * @param {string|number} details - The time details (can be a string or a timestamp).
 * @param {Intl.DateTimeFormatOptions} args - Formatting options.
 * @returns {string} - The localized time string.
 * */
export const time = (details, args = {}) => {
    return new Date(details).toLocaleTimeString(lang, args)
}
