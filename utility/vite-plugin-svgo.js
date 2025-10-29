import { optimize } from 'svgo'

/**
 * @type {() => import('vite').Plugin}
 * @param {import('svgo').Config} options
 * */
export default (options = {}) => ({
    name: 'vite-plugin-svgo',
    generateBundle(_, bundler) {
        for (const [ path, asset ] of Object.entries(bundler)) {
            if ((/\.svg$/).test(path)) {
                const { data } = optimize(asset.source.toString(), { ...options, path })

                asset.source = Buffer.from(data, 'utf-8')
            }
        }
    },
})
