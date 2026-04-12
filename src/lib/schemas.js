import * as z from 'zod/mini'

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
 * @returns {z.ZodMiniType<Promise<PendingValidation<ZodInfer<T>>>>} A Zod schema that checks for Promise instances.
 * */
export const promise = _ => {
    return z.custom(val => val instanceof Promise, 'Value must be a Promise')
}

/**
 * @template {z.ZodMiniType} T
 * @param {T} elements - The Zod schema for the elements in the NodeList.
 * @returns {z.ZodMiniType<NodeListOf<ZodInfer<T>>>} A Zod schema that checks for NodeList instances.
 * */
export const nodeListOf = elements => {
    return z.custom(
        val => val instanceof NodeList && Array.from(val).every(el => elements.parse(el)),
        `Value must be a NodeList<${elements._zod.def.type}>`,
    )
}

export const ModuleSchema = z.function({
    input: [nodeListOf(z.instanceof(HTMLElement))],
    output: z.void(),
})

export const ImportedSchema = z.object({
    default: z.string(),
})

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

export const ImagePropsSchema = z.intersection(
    z.record(z.string(), z.any()),
    z.strictObject({
        width: z.number(),
        height: z.number(),
        src: z.optional(ImageSourceSchema),
        request: z.optional(promise(ImportedSchema)),
    }),
)

export const PicturePropsSchema = z.intersection(
    z.record(z.string(), z.any()),
    z.strictObject({
        src: ImageSourceSchema,
        breakpoints: z.optional(PictureSourcesSchema),
        loading: z.optional(z.literal(['lazy', 'eager'])),
    }),
)
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
