import { scroll } from 'motion'
import { ModuleSchema } from '$lib/schemas/core'

export default ModuleSchema.implement(els => {
    for (const el of els) {
        scroll(
            /** @param {number} progress */ progress => {
                const control = progress * 2 - 1

                el.style.setProperty('--parallax-control', control.toFixed(4))
            },
            {
                target: el,
                offset: ['start end', 'end start'],
            },
        )
    }
})
