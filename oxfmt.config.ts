import type { OxfmtConfig } from 'oxfmt'

const config: OxfmtConfig = {
    semi: false,
    singleQuote: true,
    arrowParens: 'avoid',
    sortTailwindcss: true,
    sortPackageJson: true,
    quoteProps: 'consistent',
    ignorePatterns: ['.ddev/**', 'config/project/**'],
    sortImports: {
        newlinesBetween: false,
        internalPattern: ['$'],
    },
}

export default config
