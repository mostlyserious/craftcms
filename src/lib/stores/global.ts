import { MediaQuery } from 'svelte/reactivity'
import * as z from 'zod/mini'
import { AppSchema, type App } from '$lib/schemas/app'

const root = getComputedStyle(document.body)

interface ScreenState {
    'prefersReducedMotion': MediaQuery
    '2xs': string
    'is2xs': MediaQuery
    'xs': string
    'isXs': MediaQuery
    'sm': string
    'isSm': MediaQuery
    'md': string
    'isMd': MediaQuery
    'lg': string
    'isLg': MediaQuery
    'xl': string
    'isXl': MediaQuery
    '2xl': string
    'is2xl': MediaQuery
}

let app: Readonly<App> | null = null

/** Parsed on first access rather than at module init, so a `window.$app` mismatch only fails the code that reads `craft`. */
function resolve(): Readonly<App> {
    if (!app) {
        const result = AppSchema.safeParse(window.$app)

        if (!result.success) {
            throw new Error(`window.$app failed validation:\n${z.prettifyError(result.error)}`)
        }

        app = Object.freeze(result.data)
    }

    return app
}

export const craft: Readonly<App> = new Proxy({} as App, {
    get: (_, prop) => Reflect.get(resolve(), prop),
    has: (_, prop) => Reflect.has(resolve(), prop),
    ownKeys: () => Reflect.ownKeys(resolve()),
    getOwnPropertyDescriptor: (_, prop) => Object.getOwnPropertyDescriptor(resolve(), prop),
})

export const screen: Readonly<ScreenState> = Object.freeze({
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
