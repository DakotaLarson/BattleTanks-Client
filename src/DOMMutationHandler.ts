export default class DOMMutationHandler {

    public static addStyle(elt: HTMLElement, style: string, value: string) {
        elt.style.setProperty(style, value);
    }

    public static addFutureStyle(elt: HTMLElement, style: string, value: string, time: number) {
        setTimeout(() => {
            DOMMutationHandler.addStyle(elt, style, value);
        }, time);
    }

    public static removeStyle(elt: HTMLElement, style: string) {
        elt.style.removeProperty(style);
    }

    public static removeFutureStyle(elt: HTMLElement, style: string, time: number) {
        setTimeout(() => {
            DOMMutationHandler.removeStyle(elt, style);
        }, time);
    }

    public static add(elt: HTMLElement, parent?: HTMLElement) {
        if (parent) {
            parent.appendChild(elt);
        } else {
            document.body.appendChild(elt);
        }
    }

    public static insert(elt: HTMLElement, parent: HTMLElement) {
        parent.insertBefore(elt, parent.firstChild);
    }

    public static remove(elt: HTMLElement, parent: HTMLElement) {
        parent.removeChild(elt);
    }

    public static clear(elt: HTMLElement) {
        while (elt.firstChild) {
            elt.removeChild(elt.firstChild);
        }
    }

    public static setText(elt: HTMLElement, text?: string) {
        // tslint:disable-next-line
        elt.textContent = text || null;
    }

    public static setValue(elt: HTMLInputElement, value?: any) {
        elt.value = value ? value : "";
    }

    public static focus(elt: HTMLElement) {
        elt.focus();
    }

    public static show(elt: HTMLElement, style?: string) {
        DOMMutationHandler.addStyle(elt, "display", style ? style : "block");
    }

    public static hide(elt: HTMLElement) {
        DOMMutationHandler.removeStyle(elt, "display");
    }
}
