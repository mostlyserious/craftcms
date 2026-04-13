import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const root = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
    resolve: {
        alias: {
            $lib: join(root, 'src/lib'),
            $css: join(root, 'src/css'),
            $img: join(root, 'src/img'),
            $fontawesome: join(root, 'vendor/npm-asset/fortawesome--fontawesome-pro/svgs'),
        },
    },
    test: {
        environment: 'jsdom',
        include: ['src/**/*.test.js'],
    },
})
