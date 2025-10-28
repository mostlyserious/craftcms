import fs from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'vite'
import * as env from './utility/env'
import tailwindcss from '@tailwindcss/vite'
import svgo from './utility/vite-plugin-svgo'
import tinify from './utility/vite-plugin-tinify'
import { svelte } from '@sveltejs/vite-plugin-svelte'

const { VITE_BASE, VITE_PORT, VITE_TEMP, PRIMARY_SITE_URL } = env.parse()

export default defineConfig(() => {
    const outDir = join('web', VITE_TEMP || VITE_BASE)

    fs.rmSync(outDir, {
        recursive: true,
        force: true,
    })

    return {
        publicDir: false,
        base: join('/', VITE_BASE),
        plugins: [
            tailwindcss(),
            svelte(),
            tinify(),
            svgo(),
        ],
        css: {
            transformer: 'lightningcss',
            lightningcss: {
                drafts: { customMedia: true },
            },
        },
        build: {
            outDir,
            manifest: true,
            assetsInlineLimit: 0,
            cssMinify: 'lightningcss',
            rollupOptions: {
                input: [
                    'src/app',
                    'src/dashboard',
                ],
                output: {
                    entryFileNames: '[name].[hash].js',
                    chunkFileNames: '[name].[hash].js',
                    assetFileNames: '[name].[hash].[ext]',
                    manualChunks(id) {
                        if (id.includes('node_modules/svelte')) {
                            return 'svelte'
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
                '$lib': join(import.meta.dirname, 'src/lib'),
                '$css': join(import.meta.dirname, 'src/css'),
                '$img': join(import.meta.dirname, 'src/img'),
                '$fontawesome': join(import.meta.dirname, 'vendor/npm-asset/fortawesome--fontawesome-pro/svgs'),
            },
        },
        server: {
            cors: true,
            origin: `${PRIMARY_SITE_URL}:${VITE_PORT}`,
            port: VITE_PORT,
            host: '0.0.0.0',
            strictPort: true,
            watch: {
                ignored: [
                    '**/vendor/**',
                    '**/storage/**',
                    '**/config/project/**',
                ],
            },
        },
    }
})
