import fs from 'fs'
import tinify from 'tinify'
import crypto from 'crypto'

/**
 * @type {() => import('vite').Plugin}
 * */
export default () => ({
    name: 'vite-plugin-tinify',
    async generateBundle(_, bundler) {
        for (const [ path, asset ] of Object.entries(bundler)) {
            if ((/\.(png|jpe?g)$/).test(path)) {
                const checksum = crypto.createHash('sha1').update(asset.source.toString()).digest('hex')
                const checksumfile = `node_modules/.vite/tinify/${checksum}`

                let content

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
                                full !== '/' && fs.mkdirSync(full)
                            } catch (error) {
                                if (error.code !== 'EEXIST') {
                                    throw new Error(`vite-plugin-tinify: ${error.message}`)
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
