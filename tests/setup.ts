// jsdom exposes HTMLDialogElement but implements none of its methods.
if (typeof HTMLDialogElement !== 'undefined' && typeof HTMLDialogElement.prototype.showModal !== 'function') {
    HTMLDialogElement.prototype.show = function (this: HTMLDialogElement) {
        this.open = true
    }

    HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
        this.open = true
    }

    HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
        if (this.open) {
            this.open = false
            this.dispatchEvent(new Event('close'))
        }
    }
}
