/**
 * @param {Element} el
 * @param {keyof HTMLElementTagNameMap} tag
 * @param {ElementCreationOptions} options
 * @returns {HTMLElement}
 * */
export default function wrap(el, tag = 'div', options = {}) {
    const wrapper = document.createElement(tag, options)

    el.replaceWith(wrapper)
    wrapper.appendChild(el)

    return wrapper
}
