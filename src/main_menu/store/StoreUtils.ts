export default class StoreUtils {

    public static createElement(tagName: string, classList?: string[], textContent?: string, id?: string) {
        const elt = document.createElement(tagName);

        if (classList) {
            for (const cls of classList) {
                elt.classList.add(cls);
            }
        }

        if (textContent) {
            elt.textContent = textContent;
        }

        if (id) {
            elt.id = id;
        }

        return elt;
    }

    public static createColorElt(title: string, detail: string) {

        const colorElt = StoreUtils.createElement("div", ["store-item-custom-color"]);
        colorElt.style.backgroundColor = "#" + detail;
        const textElt = StoreUtils.createElement("div", [], title);
        textElt.setAttribute("title", title);

        const container = StoreUtils.createElement("div", ["store-item-custom-color-inner-container"]);
        container.appendChild(colorElt);
        container.appendChild(textElt);

        return container;
    }

    public static createArrowElt() {
        return StoreUtils.createElement("div", ["arrow-down"]);
    }

}
