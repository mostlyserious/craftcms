import * as z from 'zod/mini'
import { promise, ImageSourceSchema } from '$lib/schemas'

export const ImportedSchema = z.object({
    default: z.string(),
})

export const IconPropsSchema = z.intersection(z.record(z.string(), z.any()), z.object({
    request: promise(ImportedSchema),
}))

export const ImagePropsSchema = z.intersection(z.record(z.string(), z.any()), z.object({
    width: z.number(),
    height: z.number(),
    src: z.optional(ImageSourceSchema),
    request: z.optional(promise(ImportedSchema)),
}))
