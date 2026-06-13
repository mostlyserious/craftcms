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

function closure<T extends ViewTransitionHandler>(handler: T, ...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> {
    return new Promise<Awaited<ReturnType<T>>>(resolve => {
        if (!document.startViewTransition) {
            resolve(handler(...args) as Awaited<ReturnType<T>>)

            return
        }

        document.startViewTransition(async () => {
            resolve((await handler(...args)) as Awaited<ReturnType<T>>)
        })
    })
}
