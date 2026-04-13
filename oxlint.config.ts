import globals from 'globals'
import { defineConfig } from 'oxlint'
import { recommendedSvelteRules, toOxlintGlobals } from './utility/index.js'

const bunBuiltinGlobals = toOxlintGlobals(globals.bunBuiltin)
const svelteRules = recommendedSvelteRules()

export default defineConfig({
    plugins: ['oxc', 'typescript', 'unicorn', 'react'],
    categories: {
        correctness: 'warn',
    },
    env: {
        builtin: true,
    },
    rules: {},
    overrides: [
        {
            files: ['**/*.svelte', '**/*.svelte.js', '**/*.svelte.ts'],
            globals: {
                $bindable: 'readonly',
                $derived: 'readonly',
                $effect: 'readonly',
                $host: 'readonly',
                $inspect: 'readonly',
                $props: 'readonly',
                $state: 'readonly',
            },
            rules: {
                ...svelteRules,
                'no-inner-declarations': 'off',
                'no-self-assign': 'off',
                'svelte/valid-compile': 'off',
                'svelte/no-at-html-tags': 'off',
                'svelte/valid-style-parse': 'off',
                'svelte/no-navigation-without-resolve': 'off',
            },
            jsPlugins: ['eslint-plugin-svelte'],
        },
        {
            files: ['**/*.{js,jsx,ts,tsx,svelte}'],
            rules: {
                'curly': 'warn',
                'no-else-return': 'warn',
                'no-global-assign': 'warn',
                'no-unmodified-loop-condition': 'warn',
                'no-useless-escape': 'warn',
                'new-cap': 'warn',
                'no-continue': 'off',
                'no-lonely-if': 'warn',
                'no-unneeded-ternary': 'warn',
                'constructor-super': 'error',
                'no-class-assign': 'warn',
                'no-const-assign': 'error',
                'no-duplicate-imports': 'warn',
                'no-this-before-super': 'error',
                'no-useless-computed-key': 'warn',
                'no-useless-constructor': 'warn',
                'prefer-rest-params': 'warn',
                'prefer-spread': 'warn',
                'prefer-template': 'warn',
                'require-yield': 'warn',
                'guard-for-in': 'warn',
                'eqeqeq': 'warn',
                'no-unused-vars': [
                    'warn',
                    {
                        caughtErrorsIgnorePattern: '^_',
                        varsIgnorePattern: '^_',
                        argsIgnorePattern: '^_',
                    },
                ],
                'no-var': 'warn',
                'require-await': 'warn',
            },
        },
        {
            files: ['src/**/*.{js,jsx,ts,tsx,svelte}'],
            env: {
                browser: true,
                es2024: true,
            },
        },
        {
            files: ['tests/**/*.{js,jsx,ts,tsx,svelte}'],
            env: {
                vitest: true,
            },
        },
        {
            files: ['tests/components/**/*.{js,jsx,ts,tsx,svelte}'],
            env: {
                browser: true,
                vitest: true,
            },
        },
        {
            files: [
                'tests/api.test.{js,jsx,ts,tsx}',
                'tests/pages.test.{js,jsx,ts,tsx}',
                'tests/lib/**/*.{js,jsx,ts,tsx}',
                'tests/setup/**/*.{js,jsx,ts,tsx}',
            ],
            globals: bunBuiltinGlobals,
            env: {
                vitest: true,
            },
        },
        {
            files: ['*.{js,jsx,ts,tsx}', 'utility/*.{js,jsx,ts,tsx}'],
            globals: bunBuiltinGlobals,
        },
        {
            files: ['**/*.d.ts'],
            rules: {
                'no-unused-vars': 'off',
            },
        },
    ],
    options: {},
})
