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

export const ImageSourceSchema = z.tuple([
    ImageSchema,
    z.nullable(z.record(z.string(), z.union([
        z.string(),
        z.number(),
    ]))),
])

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

/**
 * @template T
 * @typedef {{}} PendingValidation<T> - An optimistic type that assumes the shape of T without immediate validation. It should be validated later to ensure correctness.
 * */

/**
 * Creates a custom Zod schema that validates if a value is a Promise.
 * The inferred type is Promise<PendingValidation<z.infer<typeof innerSchema>>>, indicating an optimistic assumption about the resolved value.
 * The actual validation of the resolved value should be performed later.
 * @template {z.ZodMiniType} T
 * @param {T} _ - The Zod schema for the expected resolved value of the Promise.
 * @returns {z.ZodMiniType<Promise<PendingValidation<z.infer<T>>>>} A Zod schema that checks for Promise instances.
 * */
export const promise = _ => {
    return z.custom(val => val instanceof Promise, {
        message: 'Value must be a Promise',
    })
}
