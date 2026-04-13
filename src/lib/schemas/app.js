import * as z from 'zod/mini'
import { promise } from '$lib/schemas/core'

export const PaletteSchema = z.strictObject({
    color: z.string(),
    background: z.string(),
    text: z.string(),
})

export const CsrfSchema = z.strictObject({
    name: z.string(),
    value: z.string(),
})

export const AppSchema = z.strictObject({
    isPreview: z.boolean(),
    isAdmin: z.boolean(),
    devMode: z.boolean(),
    imgixUrl: z.url(),
    objectStorageUrl: z.url(),
    lang: z.string(),
    i18n: z.nullable(z.record(z.string(), z.string())),
    csrf: z.function({
        output: promise(CsrfSchema),
    }),
    palettes: z.record(z.string(), z.record(z.string(), PaletteSchema)),
})
