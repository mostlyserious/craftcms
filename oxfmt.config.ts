import { defineConfig } from 'oxfmt'

export default defineConfig({
    printWidth: 120,
    semi: false,
    singleQuote: true,
    arrowParens: 'avoid',
    sortTailwindcss: true,
    sortPackageJson: true,
    sortImports: {
        newlinesBetween: false,
    },
})
