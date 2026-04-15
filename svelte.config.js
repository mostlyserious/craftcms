import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/**
 * @import { Config } from '@sveltejs/kit'
 * @type {Config}
 * */
export default {
    vitePlugin: { emitCss: false },
    preprocess: vitePreprocess(),
    compilerOptions: {
        experimental: {
            async: true,
        },
    },
}
