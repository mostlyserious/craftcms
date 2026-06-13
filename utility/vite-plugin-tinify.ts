import crypto from 'node:crypto'
import fs from 'node:fs'
import tinify from 'tinify'
import type { Plugin } from 'vite'

export default (): Plugin => ({
    name: 'vite-plugin-tinify',
    async generateBundle(_, bundler) {
        for (const [path, asset] of Object.entries(bundler)) {
            if (/\.(png|jpe?g)$/.test(path) && asset.type === 'asset' && typeof asset.source !== 'undefined') {
                const checksum = crypto.createHash('sha1').update(asset.source.toString()).digest('hex')
                const checksumfile = `node_modules/.vite/tinify/${checksum}`

                let content: Buffer | Uint8Array | undefined

                if (fs.existsSync(checksumfile)) {
                    content = fs.readFileSync(checksumfile)
                } else {
                    if (!process.env.TINYPNG_KEY) {
                        throw new Error('vite-plugin-tinify: TINYPNG_KEY not defined. **Images not optimized**')
                    }

                    if (!fs.existsSync('node_modules/.vite/tinify')) {
                        'node_modules/.vite/tinify'.split('/').reduce((current, next) => {
                            const full = `${current}/${next}`

                            try {
                                if (full !== '/') {
                                    fs.mkdirSync(full)
                                }
                            } catch (error) {
                                if (!(error instanceof Error && 'code' in error && error.code === 'EEXIST')) {
                                    throw new Error(
                                        `vite-plugin-tinify: ${error instanceof Error ? error.message : String(error)}`,
                                    )
                                }
                            }

                            return full
                        }, process.cwd())
                    }

                    tinify.key = process.env.TINYPNG_KEY
                    content = await tinify.fromBuffer(asset.source).toBuffer()

                    fs.writeFile(checksumfile, content, error => error && console.log(error))
                }

                if (content) {
                    asset.source = content
                }
            }
        }
    },
})
