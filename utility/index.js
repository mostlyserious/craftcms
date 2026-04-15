import svelte from 'eslint-plugin-svelte'

/** @import { DummyRuleMap, OxlintGlobals } from 'oxlint' */

/**
 * @param {string} path
 * @returns {string}
 * */
export function toBasePath(path) {
    return `${path}`.replace(/^\/+|\/+$/g, '')
}

/**
 * @param {Record<string, boolean>} source
 * */
export function toOxlintGlobals(source) {
    /** @type {OxlintGlobals} */
    const oxlintGlobals = {}

    for (const [name, isWritable] of Object.entries(source)) {
        oxlintGlobals[name] = isWritable ? 'writable' : 'readonly'
    }

    return oxlintGlobals
}

/**
 * Mirror eslint-plugin-svelte's recommended Svelte rules into Oxlint after vp migrate
 * expanded that preset inline.
 *
 * @returns {DummyRuleMap}
 * */
export function recommendedSvelteRules() {
    const preset = svelte.configs['flat/recommended']
    /** @type {DummyRuleMap} */
    const rules = {}

    for (const config of preset) {
        for (const [name, rule] of Object.entries(config.rules ?? {})) {
            if (name.startsWith('svelte/') && rule !== undefined) {
                rules[name] = rule
            }
        }
    }

    return rules
}
