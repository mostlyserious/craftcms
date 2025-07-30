import '$css/app.css'
import init from '$lib/init'
import { screen } from '$lib/stores/global'

import.meta.glob('./img/**/*')

init(document)

if (window.location.hash) {
    const target = document.querySelector(window.location.hash)

    if (target instanceof HTMLElement) {
        const observer = new PerformanceObserver(list => {
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                    window.scroll({
                        top: target.offsetTop,
                        behavior: 'auto',
                    })
                }
            }
        })

        observer.observe({
            type: 'layout-shift',
            buffered: true,
        })
    }
}

addEventListener('load', () => {
    if (!screen.prefersReducedMotion.current) {
        document.documentElement.style.scrollBehavior = 'smooth'
    }
})

addEventListener('keydown', ({ code }) => {
    if (code === 'Tab') {
        document.body.classList.add('is-tabbing')
    }
})

addEventListener('mousedown', () => {
    document.body.classList.remove('is-tabbing')
})
