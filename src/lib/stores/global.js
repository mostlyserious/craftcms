import { MediaQuery } from 'svelte/reactivity'
import { AppSchema } from '$lib/stores/schemas'

export const $app = AppSchema.parse(window.$app)

export const screen = {
    prefersReducedMotion: new MediaQuery('prefers-reduced-motion: reduce'),
    is2xs: new MediaQuery('min-width: 380px'),
    isXs: new MediaQuery('min-width: 460px'),
    isSm: new MediaQuery('min-width: 640px'),
    isMd: new MediaQuery('min-width: 768px'),
    isLg: new MediaQuery('min-width: 1024px'),
    isXl: new MediaQuery('min-width: 1280px'),
}
