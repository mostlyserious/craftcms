import globals from 'globals'
import { defineConfig } from 'oxlint'
import { toOxlintGlobals } from './utility/index.js'

const bunBuiltinGlobals = toOxlintGlobals(globals.bunBuiltin)

export default defineConfig({
    plugins: ['oxc', 'typescript', 'unicorn', 'react'],
    jsPlugins: ['eslint-plugin-svelte'],
    categories: {
        correctness: 'warn',
    },
    env: {
        builtin: true,
    },
    rules: {
        'svelte/comment-directive': 'error',
        'svelte/infinite-reactive-loop': 'error',
        'svelte/no-at-debug-tags': 'warn',
        'svelte/no-at-html-tags': 'error',
        'svelte/no-dom-manipulating': 'error',
        'svelte/no-dupe-else-if-blocks': 'error',
        'svelte/no-dupe-on-directives': 'error',
        'svelte/no-dupe-style-properties': 'error',
        'svelte/no-dupe-use-directives': 'error',
        'svelte/no-export-load-in-svelte-module-in-kit-pages': 'error',
        'svelte/no-immutable-reactive-statements': 'error',
        'svelte/no-inner-declarations': 'error',
        'svelte/no-inspect': 'warn',
        'svelte/no-navigation-without-resolve': 'error',
        'svelte/no-not-function-handler': 'error',
        'svelte/no-object-in-text-mustaches': 'error',
        'svelte/no-raw-special-elements': 'error',
        'svelte/no-reactive-functions': 'error',
        'svelte/no-reactive-literals': 'error',
        'svelte/no-reactive-reassign': 'error',
        'svelte/no-shorthand-style-property-overrides': 'error',
        'svelte/no-store-async': 'error',
        'svelte/no-svelte-internal': 'error',
        'svelte/no-unknown-style-directive-property': 'error',
        'svelte/no-unnecessary-state-wrap': 'error',
        'svelte/no-unused-props': 'error',
        'svelte/no-unused-svelte-ignore': 'error',
        'svelte/no-useless-children-snippet': 'error',
        'svelte/no-useless-mustaches': 'error',
        'svelte/prefer-svelte-reactivity': 'error',
        'svelte/prefer-writable-derived': 'error',
        'svelte/require-each-key': 'error',
        'svelte/require-event-dispatcher-types': 'error',
        'svelte/require-store-reactive-access': 'error',
        'svelte/system': 'error',
        'svelte/valid-each-key': 'error',
        'svelte/valid-prop-names-in-kit-pages': 'error',
    },
    overrides: [
        {
            files: ['*.svelte', '**/*.svelte'],
            rules: {
                'no-inner-declarations': 'off',
                'no-self-assign': 'off',
            },
            jsPlugins: ['eslint-plugin-svelte'],
        },
        {
            files: ['**/*.{js,jsx,ts,tsx,svelte}'],
            rules: {
                curly: 'warn',
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
                eqeqeq: 'warn',
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
        {
            files: ['**/*.svelte'],
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
                'svelte/valid-compile': 'off',
                'svelte/no-at-html-tags': 'off',
                'svelte/valid-style-parse': 'off',
                'svelte/no-navigation-without-resolve': 'off',
            },
            jsPlugins: ['eslint-plugin-svelte'],
        },
    ],
    options: {},
})
