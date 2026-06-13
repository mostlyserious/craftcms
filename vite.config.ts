import fs from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import * as env from './utility/env'
import { toBasePath } from './utility/index'
import svgo from './utility/vite-plugin-svgo'
import tinify from './utility/vite-plugin-tinify'

const root = dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
    const { VITE_BASE, VITE_PORT, VITE_TEMP, PRIMARY_SITE_URL } = env.parse(mode)

    const basePath = toBasePath(VITE_BASE)
    const outDir = join('web', VITE_TEMP ? toBasePath(VITE_TEMP) : basePath)

    fs.rmSync(outDir, {
        recursive: true,
        force: true,
    })

    return {
        publicDir: false,
        base: `/${basePath}/`,
        plugins: [tailwindcss(), svelte(), tinify(), svgo()],
        css: {
            transformer: 'lightningcss',
            lightningcss: {
                drafts: { customMedia: true },
                customAtRules: {
                    'reference': { prelude: '<string>', body: null },
                    'utility': { prelude: '*', body: 'style-block' },
                    'theme': { prelude: '*', body: 'style-block' },
                    'custom-variant': { prelude: '*', body: null },
                    'source': { prelude: '*', body: null },
                    'apply': { prelude: '*', body: null },
                },
            },
        },
        build: {
            outDir,
            manifest: true,
            assetsInlineLimit: 0,
            cssMinify: 'lightningcss',
            rollupOptions: {
                input: ['src/app.ts', 'src/dashboard.ts'],
                output: {
                    entryFileNames: '[name].[hash].js',
                    chunkFileNames: '[name].[hash].js',
                    assetFileNames: '[name].[hash].[ext]',
                    manualChunks(id: string) {
                        if (id.includes('node_modules/svelte')) {
                            return 'svelte'
                        }

                        if (id.includes('node_modules/motion')) {
                            return 'motion'
                        }

                        if (id.includes('node_modules/zod')) {
                            return 'zod'
                        }
                    },
                },
            },
        },
        resolve: {
            alias: {
                $lib: join(root, 'src/lib'),
                $css: join(root, 'src/css'),
                $img: join(root, 'src/img'),
                $fontawesome: join(root, 'vendor/npm-asset/fortawesome--fontawesome-pro/svgs'),
            },
        },
        server: {
            cors: true,
            origin: `${PRIMARY_SITE_URL}:${VITE_PORT}`,
            port: VITE_PORT,
            host: '0.0.0.0',
            strictPort: true,
            watch: {
                ignored: ['**/vendor/**', '**/storage/**', '**/config/project/**'],
            },
        },
    }
})
