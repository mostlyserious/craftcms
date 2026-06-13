import { optimize, type Config } from 'svgo'
import type { Plugin } from 'vite'

export default (options: Config = {}): Plugin => ({
    name: 'vite-plugin-svgo',
    generateBundle(_, bundler) {
        for (const [path, asset] of Object.entries(bundler)) {
            if (path.endsWith('.svg') && asset.type === 'asset' && typeof asset.source !== 'undefined') {
                const { data } = optimize(asset.source.toString(), { ...options, path })

                asset.source = Buffer.from(data, 'utf-8')
            }
        }
    },
})
