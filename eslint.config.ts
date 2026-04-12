import parser from '@typescript-eslint/parser'
import svelte from 'eslint-plugin-svelte'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import svelteParser from 'svelte-eslint-parser'

const svelteFiles = ['**/*.svelte']

const svelteRecommended = svelte.configs.recommended
    .filter(config => config.name !== 'svelte:base:setup-for-svelte-script')
    .map(config => ({
        ...config,
        files: svelteFiles,
    }))

export default defineConfig([
    globalIgnores(['**/*.js', '**/*.ts']),
    ...svelteRecommended,
    {
        files: svelteFiles,
        languageOptions: {
            parser: svelteParser,
            parserOptions: {
                parser,
                sourceType: 'module',
                ecmaVersion: 'latest',
                svelteFeatures: {
                    runes: true,
                },
            },
            globals: {
                ...globals.browser,
                ...globals.es2024,
                $bindable: 'readonly',
                $derived: 'readonly',
                $effect: 'readonly',
                $host: 'readonly',
                $inspect: 'readonly',
                $props: 'readonly',
                $state: 'readonly',
            },
        },
        rules: {
            'arrow-parens': ['warn', 'as-needed'],
            'curly': 'warn',
            'eqeqeq': 'warn',
            'guard-for-in': 'warn',
            'new-cap': 'warn',
            'no-class-assign': 'warn',
            'no-const-assign': 'error',
            'no-continue': 'off',
            'no-duplicate-imports': 'warn',
            'no-else-return': 'warn',
            'no-global-assign': 'warn',
            'no-inner-declarations': 'off',
            'no-lonely-if': 'warn',
            'no-self-assign': 'off',
            'no-this-before-super': 'error',
            'no-unmodified-loop-condition': 'warn',
            'no-unneeded-ternary': 'warn',
            'no-unused-vars': [
                'warn',
                {
                    caughtErrorsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    argsIgnorePattern: '^_',
                },
            ],
            'no-useless-computed-key': 'warn',
            'no-useless-constructor': 'warn',
            'no-useless-escape': 'warn',
            'no-var': 'warn',
            'prefer-rest-params': 'warn',
            'prefer-spread': 'warn',
            'prefer-template': 'warn',
            'quotes': [
                'warn',
                'single',
                {
                    avoidEscape: true,
                    allowTemplateLiterals: true,
                },
            ],
            'quote-props': ['warn', 'consistent-as-needed'],
            'require-await': 'warn',
            'require-yield': 'warn',
            'semi': ['warn', 'never'],
            'svelte/comment-directive': 'error',
            'svelte/infinite-reactive-loop': 'error',
            'svelte/no-at-debug-tags': 'warn',
            'svelte/no-at-html-tags': 'off',
            'svelte/no-dom-manipulating': 'error',
            'svelte/no-dupe-else-if-blocks': 'error',
            'svelte/no-dupe-on-directives': 'error',
            'svelte/no-dupe-style-properties': 'error',
            'svelte/no-dupe-use-directives': 'error',
            'svelte/no-export-load-in-svelte-module-in-kit-pages': 'error',
            'svelte/no-immutable-reactive-statements': 'error',
            'svelte/no-inner-declarations': 'error',
            'svelte/no-inspect': 'warn',
            'svelte/no-navigation-without-resolve': 'off',
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
            'svelte/valid-compile': 'off',
            'svelte/valid-each-key': 'error',
            'svelte/valid-prop-names-in-kit-pages': 'error',
            'svelte/valid-style-parse': 'off',
        },
    },
])
