import { MediaQuery } from 'svelte/reactivity'
import { AppSchema } from '$lib/stores/schemas'

const root = getComputedStyle(document.body)

export const $app = Object.freeze(AppSchema.parse(window.$app))

export const $screen = Object.freeze({
    prefersReducedMotion: new MediaQuery('prefers-reduced-motion: reduce'),
    is2xs: new MediaQuery(`min-width: ${root.getPropertyValue('--breakpoint-2xs')}`),
    isXs: new MediaQuery(`min-width: ${root.getPropertyValue('--breakpoint-xs')}`),
    isSm: new MediaQuery(`min-width: ${root.getPropertyValue('--breakpoint-sm')}`),
    isMd: new MediaQuery(`min-width: ${root.getPropertyValue('--breakpoint-md')}`),
    isLg: new MediaQuery(`min-width: ${root.getPropertyValue('--breakpoint-lg')}`),
    isXl: new MediaQuery(`min-width: ${root.getPropertyValue('--breakpoint-xl')}`),
    is2xl: new MediaQuery(`min-width: ${root.getPropertyValue('--breakpoint-2xl')}`),
})
