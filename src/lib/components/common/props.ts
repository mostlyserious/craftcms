import * as z from 'zod/mini'
import { ImportedSchema, promise } from '$lib/schemas/core'
import { ImageSourceSchema, PictureSourcesSchema, EmbedSchema, VideoSchema } from '$lib/schemas/media'

export const IconPropsSchema = z.intersection(
    z.record(z.string(), z.unknown()),
    z.strictObject({
        request: promise(ImportedSchema),
    }),
)

export const ImagePropsSchema = z.intersection(
    z.record(z.string(), z.unknown()),
    z.strictObject({
        width: z.number(),
        height: z.number(),
        src: z.optional(ImageSourceSchema),
        request: z.optional(promise(ImportedSchema)),
    }),
)

export const PicturePropsSchema = z.intersection(
    z.record(z.string(), z.unknown()),
    z.strictObject({
        src: ImageSourceSchema,
        breakpoints: z.optional(PictureSourcesSchema),
        loading: z.optional(z.enum(['lazy', 'eager'])),
    }),
)

export const VideoBlockSchema = z.strictObject({
    asset: z.union([VideoSchema, EmbedSchema]),
    playInline: z.optional(z.boolean()),
})

export type IconProps = ZodInfer<typeof IconPropsSchema>
export type ImageProps = ZodInfer<typeof ImagePropsSchema>
export type PictureProps = ZodInfer<typeof PicturePropsSchema>
export type VideoBlockProps = ZodInfer<typeof VideoBlockSchema>
