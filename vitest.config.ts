import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vitest/config'

const root = dirname(fileURLToPath(import.meta.url))
// Vitest 4.0's config type resolves Vite 7 PluginOption while this project uses the Vite 8 Svelte plugin.
const sveltePlugin = svelte() as never

export default defineConfig({
    plugins: [sveltePlugin],
    resolve: {
        conditions: ['browser'],
        alias: {
            $lib: join(root, 'src/lib'),
            $css: join(root, 'src/css'),
            $img: join(root, 'src/img'),
            $fontawesome: join(root, 'vendor/npm-asset/fortawesome--fontawesome-pro/svgs'),
        },
    },
    test: {
        environment: 'jsdom',
        include: ['tests/**/*.test.ts'],
    },
})
