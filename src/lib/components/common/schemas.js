import * as z from 'zod/mini'
import * as s from '$lib/schemas'

export const IconPropsSchema = z.intersection(
    z.record(z.string(), z.any()),
    z.object({
        request: s.promise(s.ImportedSchema),
    }),
)

export const ImagePropsSchema = z.intersection(
    z.record(z.string(), z.any()),
    z.object({
        width: z.number(),
        height: z.number(),
        src: z.optional(s.ImageSourceSchema),
        request: z.optional(s.promise(s.ImportedSchema)),
    }),
)

export const PicturePropsSchema = z.intersection(
    z.record(z.string(), z.any()),
    z.strictObject({
        src: s.ImageSourceSchema,
        breakpoints: z.optional(s.PictureSourcesSchema),
        loading: z.optional(z.literal(['lazy', 'eager'])),
    }),
)

export const VideoBlockSchema = z.strictObject({
    asset: z.union([s.VideoSchema, s.EmbedSchema]),
    playInline: z.optional(z.boolean()),
})
