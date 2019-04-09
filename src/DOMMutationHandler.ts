export default class DOMMutationHandler {

    public static addStyle(elt: HTMLElement, style: string, value: string) {
        return fastdom.mutate(() => {
            elt.style.setProperty(style, value);
        });
    }

    public static addFutureStyle(elt: HTMLElement, style: string, value: string, time: number) {
        setTimeout(() => {
            DOMMutationHandler.addStyle(elt, style, value);
        }, time);
    }

    public static removeStyle(elt: HTMLElement, style: string) {
        return fastdom.mutate(() => {
            elt.style.removeProperty(style);
        });
    }

    public static removeFutureStyle(elt: HTMLElement, style: string, time: number) {
        setTimeout(() => {
            DOMMutationHandler.removeStyle(elt, style);
        }, time);
    }

    public static add(elt: HTMLElement, parent?: HTMLElement) {
        return fastdom.mutate(() => {
            if (parent) {
                parent.appendChild(elt);
            } else {
                document.body.appendChild(elt);
            }
        });
    }

    public static insert(elt: HTMLElement, parent: HTMLElement) {
        return fastdom.mutate(() => {
            parent.insertBefore(elt, parent.firstChild);
        });
    }

    public static remove(elt: HTMLElement, parent: HTMLElement) {
        return fastdom.mutate(() => {
            parent.removeChild(elt);
        });
    }

    public static clear(elt: HTMLElement) {
        return fastdom.mutate(() => {
            while (elt.firstChild) {
                elt.removeChild(elt.firstChild);
            }
        });
    }

    public static setText(elt: HTMLElement, text?: string) {
        return fastdom.mutate(() => {
            // tslint:disable-next-line
            elt.textContent = text || null;
        });
    }

    public static setValue(elt: HTMLInputElement, value?: any) {
        return fastdom.mutate(() => {
            elt.value = value ? value : "";
        });
    }

    public static focus(elt: HTMLElement) {
        return fastdom.mutate(() => {
            elt.focus();
        });
    }

    public static show(elt: HTMLElement, style?: string) {
        DOMMutationHandler.addStyle(elt, "display", style ? style : "block");
    }

    public static hide(elt: HTMLElement) {
        DOMMutationHandler.removeStyle(elt, "display");
    }

    public static clearTask(task: () => void) {
        fastdom.clear(task);
    }
}
