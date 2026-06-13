import type { Component } from 'svelte'
import type { ZodMiniType } from 'zod/mini'

export type SveltifyComponentEntry<T extends ZodMiniType> = [() => Promise<{ default: Component<ZodInfer<T>> }>, T]

export default function component<T extends ZodMiniType>(
    request: () => Promise<{ default: Component<ZodInfer<T>> }>,
    schema: T,
): SveltifyComponentEntry<T> {
    return [request, schema]
}
