/**
 * @import { Component } from 'svelte'
 * @import { ZodMiniType } from 'zod/mini'
 * */

/**
 * @template {ZodMiniType} T
 * @typedef {[() => Promise<{ default: Component<ZodInfer<T>, {}, ''> }>, T]} SveltifyComponentEntry
 * */

/** Defines a typed Svelte component entry.
 * @template {ZodMiniType} T
 * @param {() => Promise<{ default: Component<ZodInfer<T>, {}, ''> }>} request
 * @param {T} schema
 * @returns {SveltifyComponentEntry<T>}
 * */
export default function component(request, schema) {
    return [request, schema]
}
