const range = document.createRange()
const parse = range.createContextualFragment.bind(range)

type MarkupAttrs = Record<string, string | number>

export default function markup(string: string, attrs?: MarkupAttrs, returnNode?: false): string
export default function markup(
    string: string,
    attrs: MarkupAttrs | undefined,
    returnNode: true,
): HTMLElement | SVGElement

export default function markup(
    string: string,
    attrs: MarkupAttrs = {},
    returnNode = false,
): string | HTMLElement | SVGElement {
    const fragment = parse(string || '').firstChild

    if (fragment instanceof HTMLElement || fragment instanceof SVGElement) {
        for (const [key, value] of Object.entries(attrs)) {
            fragment.setAttribute(key, String(value))
        }

        return returnNode ? fragment : fragment.outerHTML
    }

    return returnNode ? document.createElement('span') : ''
}
