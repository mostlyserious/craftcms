import { ModuleSchema } from '$lib/schemas/core'

export default ModuleSchema.implement((els: NodeListOf<HTMLElement>) => {
    for (const el of els) {
        const target = el.dataset.controls
            ? document.querySelector(el.dataset.controls)
            : console.error('No target specified for controls', el.dataset)

        if (target instanceof HTMLMediaElement) {
            if (target.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) {
                target.addEventListener('canplay', () => classes(el, target))
            } else {
                classes(el, target)
            }

            el.addEventListener('click', async () => {
                if (target.paused) {
                    await target.play()
                } else {
                    target.pause()
                }

                classes(el, target)
            })
        }
    }
})

function classes(el: HTMLElement, target: HTMLMediaElement): void {
    if (target.paused) {
        el.classList.add('is-paused')
        el.classList.remove('is-playing')
    } else {
        el.classList.remove('is-paused')
        el.classList.add('is-playing')
    }
}
