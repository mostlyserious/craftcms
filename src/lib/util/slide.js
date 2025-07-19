/**
 * @param {HTMLElement} target
 * */
export function slideUp(target, duration = 500) {
    target.style.transitionProperty = 'height, margin, padding'
    target.style.transitionDuration = `${duration}ms`
    target.style.boxSizing = 'border-box'
    target.style.height = `${target.offsetHeight}px`
    target.offsetHeight
    target.style.overflow = 'hidden'
    target.style.height = '0'
    target.style.paddingTop = '0'
    target.style.paddingBottom = '0'
    target.style.marginTop = '0'
    target.style.marginBottom = '0'

    window.setTimeout(() => {
        target.style.display = 'none'
        target.style.removeProperty('height')
        target.style.removeProperty('padding-top')
        target.style.removeProperty('padding-bottom')
        target.style.removeProperty('margin-top')
        target.style.removeProperty('margin-bottom')
        target.style.removeProperty('overflow')
        target.style.removeProperty('transition-duration')
        target.style.removeProperty('transition-property')
    }, duration)
}

/**
 * @param {HTMLElement} target
 * */
export function slideDown(target, duration = 500) {
    const data = {
        display: '',
        height: 0,
    }

    target.style.removeProperty('display')
    data.display = window.getComputedStyle(target).display

    if (data.display === 'none') {
        data.display = 'block'
    }

    target.style.display = data.display
    data.height = target.offsetHeight

    target.style.overflow = 'hidden'
    target.style.height = '0'
    target.style.paddingTop = '0'
    target.style.paddingBottom = '0'
    target.style.marginTop = '0'
    target.style.marginBottom = '0'
    target.offsetHeight
    target.style.boxSizing = 'border-box'
    target.style.transitionProperty = 'height, margin, padding'
    target.style.transitionDuration = `${duration}ms`
    target.style.height = `${data.height}px`
    target.style.removeProperty('padding-top')
    target.style.removeProperty('padding-bottom')
    target.style.removeProperty('margin-top')
    target.style.removeProperty('margin-bottom')

    window.setTimeout(() => {
        target.style.removeProperty('height')
        target.style.removeProperty('overflow')
        target.style.removeProperty('transition-duration')
        target.style.removeProperty('transition-property')
    }, duration)
}

/**
 * @param {HTMLElement} target
 * */
export function slideToggle(target, duration = 500) {
    if (window.getComputedStyle(target).display === 'none') {
        return slideDown(target, duration)
    }

    return slideUp(target, duration)
}
