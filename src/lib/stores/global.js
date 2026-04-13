import { MediaQuery } from 'svelte/reactivity'
import { AppSchema } from '$lib/stores/schemas'

const root = getComputedStyle(document.body)

export const craft = Object.freeze(AppSchema.parse(window.$app))

export const screen = Object.freeze({
    'prefersReducedMotion': new MediaQuery('prefers-reduced-motion: reduce'),
    '2xs': root.getPropertyValue('--breakpoint-2xs'), // custom
    'is2xs': new MediaQuery(`min-width: ${root.getPropertyValue('--breakpoint-2xs')}`),
    'xs': root.getPropertyValue('--breakpoint-xs'), // custom
    'isXs': new MediaQuery(`min-width: ${root.getPropertyValue('--breakpoint-xs')}`),
    'sm': root.getPropertyValue('--breakpoint-sm'), // TailwindCSS default
    'isSm': new MediaQuery(`min-width: ${root.getPropertyValue('--breakpoint-sm')}`),
    'md': root.getPropertyValue('--breakpoint-md'), // TailwindCSS default
    'isMd': new MediaQuery(`min-width: ${root.getPropertyValue('--breakpoint-md')}`),
    'lg': root.getPropertyValue('--breakpoint-lg'), // TailwindCSS default
    'isLg': new MediaQuery(`min-width: ${root.getPropertyValue('--breakpoint-lg')}`),
    'xl': root.getPropertyValue('--breakpoint-xl'), // TailwindCSS default
    'isXl': new MediaQuery(`min-width: ${root.getPropertyValue('--breakpoint-xl')}`),
    '2xl': root.getPropertyValue('--breakpoint-2xl'), // TailwindCSS default
    'is2xl': new MediaQuery(`min-width: ${root.getPropertyValue('--breakpoint-2xl')}`),
})
