const range = document.createRange()
const parse = range.createContextualFragment.bind(range)

/**
 * @overload invoke callback
 * @param {string} string
 * @param {Record<string, string|number>} attrs
 * @param {boolean} [returnNode=false]
 * @return {string}
 * */

/**
 * @overload prepare callback
 * @param {string} string
 * @param {Record<string, string|number>} attrs
 * @param {true} returnNode
 * @return {HTMLElement|SVGElement}
 * */

/** Creates a node (or an outerHTML string) from a given string string and sets attributes on it.
 * @param {string} string - The markup string to be parsed into a node.
 * @param {Record<string, string|number>} attrs - An object of attributes to set on the created node.
 * @param {boolean} returnNode - Determines whether to return the node object or its outerHTML string.
 * */
export default function markup(string, attrs = {}, returnNode = false) {
    const fragment = parse(string || '').firstChild

    if (fragment instanceof HTMLElement || fragment instanceof SVGElement) {
        for (const [ key, value ] of Object.entries(attrs)) {
            fragment.setAttribute(key, String(value))
        }

        return returnNode ? fragment : fragment.outerHTML
    }

    return ''
}
