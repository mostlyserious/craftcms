import globals from 'globals'
import parser from '@typescript-eslint/parser'
import svelteParser from 'svelte-eslint-parser'

/**
 * @import { FlatESLintConfig } from 'eslint-define-config'
 * @type {Array<FlatESLintConfig>}
 * */
export default [
    {
        files: [ '**/*.{js,jsx,ts,tsx,svelte}' ],
        languageOptions: {
            parser,
            parserOptions: {
                sourceType: 'module',
                ecmaVersion: 'latest',
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        rules: {
            'curly': 1,
            'no-else-return': 1,
            'no-floating-decimal': 1,
            'no-global-assign': 1,
            'no-multi-spaces': 1,
            'no-unmodified-loop-condition': 1,
            'no-useless-escape': 1,
            'array-bracket-spacing': [ 1, 'always' ],
            'brace-style': [ 1, '1tbs', { allowSingleLine: true } ],
            'camelcase': [ 1, {
                properties: 'never',
            } ],
            'comma-dangle': [ 1, {
                arrays: 'always-multiline',
                objects: 'always-multiline',
                imports: 'always-multiline',
                exports: 'always-multiline',
                functions: 'always-multiline',
            } ],
            'comma-spacing': 1,
            'comma-style': 1,
            'computed-property-spacing': 1,
            'func-call-spacing': 1,
            'indent': [ 1, 4, {
                SwitchCase: 1,
                ignoredNodes: [ 'TemplateLiteral *' ],
            } ],
            'key-spacing': 1,
            'keyword-spacing': 1,
            'new-cap': 1,
            'padding-line-between-statements': [ 1,
                {
                    blankLine: 'always',
                    prev: '*',
                    next: 'return',
                },
                {
                    blankLine: 'always',
                    prev: [ 'const', 'let', 'var' ],
                    next: '*',
                },
                {
                    blankLine: 'any',
                    prev: '*',
                    next: [ 'import', 'export' ],
                },
                {
                    blankLine: 'any',
                    prev: [ 'const', 'let', 'var' ],
                    next: [ 'const', 'let', 'var' ],
                },
                {
                    blankLine: 'always',
                    prev: 'block-like',
                    next: '*',
                },
            ],
            'no-continue': 0,
            'no-lonely-if': 1,
            'no-mixed-operators': [ 1, {
                groups: [
                    [ '&', '|', '^', '~', '<<', '>>', '>>>' ],
                    [ '==', '!=', '===', '!==', '>', '>=', '<', '<=' ],
                    [ '&&', '||' ],
                    [ 'in', 'instanceof' ],
                ],
            } ],
            'no-multiple-empty-lines': [ 1, {
                max: 1,
            } ],
            'no-tabs': 1,
            'one-var': [ 1, 'never' ],
            'no-unneeded-ternary': 1,
            'no-whitespace-before-property': 1,
            'object-curly-spacing': [ 1, 'always' ],
            'one-var-declaration-per-line': 1,
            'operator-linebreak': [ 1, 'after', {
                overrides: {
                    '?': 'before',
                    ':': 'before',
                    '&&': 'before',
                    '||': 'before',
                },
            } ],
            'quotes': [ 1, 'single', {
                avoidEscape: true,
                allowTemplateLiterals: true,
            } ],
            'semi-spacing': 1,
            'space-before-blocks': 1,
            'space-before-function-paren': [ 1, {
                anonymous: 'never',
                named: 'never',
                asyncArrow: 'always',
            } ],
            'space-in-parens': 1,
            'space-infix-ops': 1,
            'space-unary-ops': 1,
            'wrap-regex': 1,
            'arrow-spacing': 1,
            'constructor-super': 2,
            'no-class-assign': 1,
            'no-const-assign': 2,
            'no-duplicate-imports': 1,
            'no-this-before-super': 2,
            'no-useless-computed-key': 1,
            'no-useless-constructor': 1,
            'prefer-arrow-callback': 1,
            'arrow-parens': [ 1, 'as-needed' ],
            'prefer-rest-params': 1,
            'prefer-spread': 1,
            'prefer-template': 1,
            'require-yield': 1,
            'template-curly-spacing': 1,
            'guard-for-in': 1,
            'eqeqeq': 1,
            'no-unused-vars': [ 1, {
                caughtErrorsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                argsIgnorePattern: '^_',
            } ],
            'no-undef': 2,
            'no-var': 1,
            'semi': [ 1, 'never' ],
            'no-extra-semi': 1,
            'require-await': 1,
        },
    },
    {
        files: [ 'src/**/*.{js,jsx,ts,tsx,svelte}' ],
        languageOptions: {
            globals: {
                ...globals.browser,
            },
        },
    },
    {
        files: [ '*.{js,jsx,ts,tsx}', 'vite/*.{js,jsx,ts,tsx}' ],
        languageOptions: {
            globals: {
                Bun: 'readonly',
                ...globals.node,
            },
        },
    },
    {
        files: [ '**/*.d.ts' ],
        rules: {
            'no-unused-vars': 0,
        },
    },
    {
        files: [ '**/*.svelte' ],
        languageOptions: {
            parser: svelteParser,
            parserOptions: {
                svelteFeatures: {
                    runes: true,
                    experimentalGenerics: false,
                },
            },
        },
    },
    {
        files: [ '**/*.svelte', '**/*.svelte.js' ],
        languageOptions: {
            globals: {
                $state: 'readonly',
                $derived: 'readonly',
                $effect: 'readonly',
                $props: 'readonly',
                $bindable: 'readonly',
                $inspect: 'readonly',
                $host: 'readonly',
            },
        },
    },
]
