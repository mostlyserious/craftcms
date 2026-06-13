export default function wrap<K extends keyof HTMLElementTagNameMap>(
    el: Element,
    tag: K = 'div' as K,
    options: ElementCreationOptions = {},
): HTMLElementTagNameMap[K] {
    const wrapper = document.createElement(tag, options)

    el.replaceWith(wrapper)
    wrapper.appendChild(el)

    return wrapper
}
