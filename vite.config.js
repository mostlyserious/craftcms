import fs from 'node:fs'
import path from 'node:path'
import * as env from './vite/env'
import { defineConfig } from 'vite'
import svgo from './vite/vite-plugin-svgo'
import tailwindcss from '@tailwindcss/vite'
import tinify from './vite/vite-plugin-tinify'
import { svelte } from '@sveltejs/vite-plugin-svelte'

const { VITE_BASE, VITE_TEMP, PRIMARY_SITE_URL, VITE_PORT } = env.parse()

export default defineConfig(() => {
    if (fs.existsSync(`web${VITE_TEMP || VITE_BASE}`)) {
        fs.rmSync(`web${VITE_TEMP || VITE_BASE}`, { recursive: true })
    }

    return {
        publicDir: false,
        base: VITE_BASE,
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
            manifest: true,
            outDir: `web${VITE_TEMP || VITE_BASE}`,
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
                '$lib': path.resolve(__dirname, 'src/lib'),
                '$css': path.resolve(__dirname, 'src/css'),
                '$img': path.resolve(__dirname, 'src/img'),
                '$fontawesome': path.resolve(__dirname, 'vendor/npm-asset/fortawesome--fontawesome-pro/svgs'),
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
