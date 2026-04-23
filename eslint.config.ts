import type { Linter } from 'eslint'
import jsdoc from 'eslint-plugin-jsdoc'
import svelte from 'eslint-plugin-svelte'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import svelteConfig from './svelte.config.js'

const browserGlobals = {
    ...globals.browser,
    ...globals.es2024,
}

const { 'flat/recommended': svelteRecommended } = svelte.configs

const sharedRules = {
    'jsdoc/reject-any-type': 'warn',
    'no-unused-vars': ['warn', { caughtErrorsIgnorePattern: '^_', varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
} satisfies NonNullable<Linter.Config['rules']>

const svelteScriptStyleRules = {
    'arrow-parens': ['warn', 'as-needed'],
    'quote-props': ['warn', 'consistent-as-needed'],
    'quotes': ['warn', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
    'semi': ['warn', 'never'],
} satisfies NonNullable<Linter.Config['rules']>

const svelteRuleOverrides = {
    'svelte/no-at-html-tags': 'off',
    'svelte/no-navigation-without-resolve': 'off',
    'svelte/valid-compile': 'off',
    'svelte/valid-style-parse': 'off',
} satisfies NonNullable<Linter.Config['rules']>

const svelteConfigs = svelteRecommended.map(config => {
    if (!config.files) {
        if (!config.rules) {
            return config
        }

        return {
            ...config,
            files: ['src/**/*.svelte'],
        }
    }

    if (config.files.some(pattern => pattern.includes('.svelte.'))) {
        return {
            ...config,
            files: ['src/**/*.svelte.js', 'src/**/*.svelte.ts'],
        }
    }

    return {
        ...config,
        files: ['src/**/*.svelte'],
    }
})

export default defineConfig([
    ...svelteConfigs,
    {
        files: ['src/**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: browserGlobals,
        },
        plugins: {
            jsdoc,
        },
        settings: {
            jsdoc: {
                mode: 'typescript',
            },
        },
        rules: sharedRules,
    },
    {
        files: ['src/**/*.svelte'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: browserGlobals,
            parserOptions: {
                svelteConfig,
            },
        },
        plugins: {
            jsdoc,
        },
        settings: {
            jsdoc: {
                mode: 'typescript',
            },
        },
        rules: {
            ...sharedRules,
            ...svelteScriptStyleRules,
            ...svelteRuleOverrides,
        },
    },
])
