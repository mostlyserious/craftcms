import * as z from 'zod/mini'

export const ImageSchema = z.strictObject({
    uid: z.uuid(),
    src: z.url(),
    alt: z.string(),
    width: z.number(),
    height: z.number(),
    extension: z.string(),
    hasFocalPoint: z.boolean(),
    focalPoint: z.strictObject({
        x: z.number(),
        y: z.number(),
    }),
})

export const ImageTransformArgsSchema = z.record(z.string(), z.union([z.string(), z.number()]))

export const ImageSourceSchema = z.tuple([ImageSchema, z.nullable(ImageTransformArgsSchema)])

export const PictureSourcesSchema = z.record(z.string(), ImageTransformArgsSchema)

export const VideoSchema = z.strictObject({
    type: z.literal('upload'),
    uid: z.uuid(),
    title: z.string(),
    slug: z.string(),
    alt: z.string(),
    src: z.url(),
    extension: z.string(),
    mime: z.string(),
})

export const EmbedSchema = z.strictObject({
    type: z.literal('embed'),
    title: z.string(),
    description: z.string(),
    src: z.url(),
    width: z.number(),
    height: z.number(),
    aspectRatio: z.number(),
    image: z.url(),
    source: z.string(),
})
