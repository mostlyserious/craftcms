import * as z from 'zod/mini'

/**
 * @template T
 * @typedef {{}} PendingValidation
 * */

/**
 * @template {z.ZodMiniType} T
 * @param {T} _
 * @returns {z.ZodMiniType<Promise<PendingValidation<ZodInfer<T>>>>}
 * */
export const promise = _ => {
    return z.custom(val => val instanceof Promise, 'Value must be a Promise')
}

export const ImportedSchema = z.strictObject({
    default: z.string(),
})

/**
 * @template {z.ZodMiniType} T
 * @param {T} elements
 * @returns {z.ZodMiniType<NodeListOf<ZodInfer<T>>>}
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
