import fs from 'node:fs'
import { join } from 'node:path'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite-plus'
import * as env from './utility/env'
import { toBasePath } from './utility/index'
import svgo from './utility/vite-plugin-svgo'
import tinify from './utility/vite-plugin-tinify'

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
            },
        },
        build: {
            outDir,
            manifest: true,
            assetsInlineLimit: 0,
            cssMinify: 'lightningcss',
            rollupOptions: {
                input: ['src/app', 'src/dashboard'],
                output: {
                    entryFileNames: '[name].[hash].js',
                    chunkFileNames: '[name].[hash].js',
                    assetFileNames: '[name].[hash].[ext]',
                    manualChunks(id) {
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
                $lib: join(import.meta.dirname, 'src/lib'),
                $css: join(import.meta.dirname, 'src/css'),
                $img: join(import.meta.dirname, 'src/img'),
                $fontawesome: join(import.meta.dirname, 'vendor/npm-asset/fortawesome--fontawesome-pro/svgs'),
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
