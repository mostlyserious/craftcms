import * as z from 'zod/mini'
import type { infer as Infer, ZodMiniType } from 'zod/mini'

export const promise = <T extends ZodMiniType>(_schema: T): ZodMiniType<Promise<Infer<T>>> => {
    return z.custom(val => val instanceof Promise, 'Value must be a Promise')
}

export const ImportedSchema = z.strictObject({
    default: z.string(),
})

export const nodeListOf = <T extends ZodMiniType<Node>>(elements: T): ZodMiniType<NodeListOf<Infer<T>>> => {
    return z.custom(
        val => val instanceof NodeList && Array.from(val).every(el => elements.parse(el)),
        `Value must be a NodeList<${elements._zod.def.type}>`,
    )
}

export const ModuleSchema = z.function({
    input: [nodeListOf(z.instanceof(HTMLElement))],
    output: z.unknown(),
})

export type ModuleHandler = (els: NodeListOf<HTMLElement>) => void | (() => void)
