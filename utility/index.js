/**
 * @param {string} path
 * @returns {string}
 */
export function toBasePath(path) {
    return `${path}`.replace(/^\/+|\/+$/g, '')
}

/**
 * @import { OxlintGlobals } from 'oxlint'
 * @param {Record<string, boolean>} source
 */
export function toOxlintGlobals(source) {
    /** @type {OxlintGlobals} */
    const oxlintGlobals = {}

    for (const [name, isWritable] of Object.entries(source)) {
        oxlintGlobals[name] = isWritable ? 'writable' : 'readonly'
    }

    return oxlintGlobals
}
