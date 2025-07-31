import * as z from 'zod/mini'
import { promise } from '$lib/schemas'

export const CsrfSchema = z.object({
    name: z.string(),
    value: z.string(),
})

export const PalletteSchema = z.object({
    color: z.string(),
    background: z.string(),
    text: z.string(),
})

export const AppSchema = z.object({
    isPreview: z.boolean(),
    isAdmin: z.boolean(),
    devMode: z.boolean(),
    objectStorageUrl: z.string(),
    assetsUrl: z.string(),
    lang: z.string(),
    i18n: z.nullable(z.record(z.string(), z.string())),
    csrf: promise(CsrfSchema),
    palettes: z.object({
        background: z.object({
            default: PalletteSchema,
            lightGray: PalletteSchema,
        }),
        misc: z.object({
            footer: PalletteSchema,
        }),
    }),
})
