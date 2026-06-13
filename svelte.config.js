import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/vite-plugin-svelte').SvelteConfig} */
const config = {
    vitePlugin: { emitCss: false },
    preprocess: vitePreprocess(),
    compilerOptions: {
        experimental: {
            async: true,
        },
    },
}

export default config
