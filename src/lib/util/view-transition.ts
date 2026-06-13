type ViewTransitionHandler = (...args: unknown[]) => unknown

export function viewTransitionClosure<T extends ViewTransitionHandler>(
    handler: T,
    ...args: Parameters<T>
): () => Promise<Awaited<ReturnType<T>>> {
    return () => closure(handler, ...args)
}

export function viewTransition<T extends ViewTransitionHandler>(
    handler: T,
    ...args: Parameters<T>
): Promise<Awaited<ReturnType<T>>> {
    return closure(handler, ...args)
}

async function closure<T extends ViewTransitionHandler>(
    handler: T,
    ...args: Parameters<T>
): Promise<Awaited<ReturnType<T>>> {
    if (!document.startViewTransition) {
        return (await handler(...args)) as Awaited<ReturnType<T>>
    }

    let handlerResult: Promise<Awaited<ReturnType<T>>> | null = null
    const transition = document.startViewTransition(() => {
        handlerResult = Promise.resolve(handler(...args)).then(result => result as Awaited<ReturnType<T>>)

        return handlerResult.then(() => undefined)
    })

    await transition.updateCallbackDone

    if (!handlerResult) {
        throw new Error('View transition update callback was not invoked.')
    }

    return await handlerResult
}
