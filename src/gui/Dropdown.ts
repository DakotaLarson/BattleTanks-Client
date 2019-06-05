import ChildComponent from "../component/ChildComponent";
import EventHandler from "../EventHandler";

export default class Dropdown extends ChildComponent {

    private static nextId = 1;

    private id: number;
    private visible: boolean;

    private idsByElts: Map<HTMLElement, string>;
    private lastUpdatedId: string | undefined;

    private parent: HTMLElement;
    private header: HTMLElement;
    private container: HTMLElement;

    constructor(elts: Map<HTMLElement, string>, header: HTMLElement) {
        super();

        this.id = Dropdown.nextId ++;
        this.visible = false;

        this.idsByElts = new Map();

        const constructedElts = this.constructDropdown(elts, header);
        this.parent = constructedElts[0];
        this.header = constructedElts[1];
        this.container = constructedElts[2];
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onClick);
    }

    public disable() {
        this.visible = false;
        this.toggle(false);

        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onClick);
    }

    public getElement() {
        return this.parent;
    }

    public getId() {
        return this.id;
    }

    private onClick(event: MouseEvent) {
        if (this.visible) {
            if (!this.container.contains(event.target as Node)) {
                this.visible = false;
                this.toggle(this.visible);
            } else {
                for (const [elt, id] of this.idsByElts) {
                    if (event.target === elt || elt.contains(event.target as Node)) {
                        this.header.removeChild(this.header.firstChild!);
                        this.header.appendChild(elt.cloneNode(true));

                        if (id !== this.lastUpdatedId) {
                            EventHandler.callEvent(EventHandler.Event.DROPDOWN_UPDATE, {
                                dropdown: this.id,
                                id,
                            });
                            this.lastUpdatedId = id;
                        }

                        this.visible = false;
                        this.toggle(this.visible);

                        break;
                    }
                }
            }

        } else if (this.parent.contains(event.target as Node)) {
            this.visible = true;
            this.toggle(this.visible);
        }
    }

    private toggle(visible: boolean) {
        if (visible) {
            this.container.style.display = "block";
        } else {
            this.container.style.display = "";
        }
    }

    private constructDropdown(elts: Map<HTMLElement, string>, headerElt: HTMLElement) {
        const parent = this.createElement("div", ["dropdown-parent"]);
        const header = this.createElement("div", ["dropdown-header"]);
        const container = this.createElement("div", ["dropdown-container"]);

        header.appendChild(headerElt.cloneNode(true));
        for (const [elt, id] of elts) {
            const clone = elt.cloneNode(true);
            container.appendChild(clone);

            this.idsByElts.set(clone as HTMLElement, id);
            if (clone.isEqualNode(headerElt)) {
                this.lastUpdatedId = id;
            }
        }

        parent.appendChild(header);
        parent.appendChild(container);

        return [parent, header, container];
    }

    private createElement(tagName: string, classList?: string[]) {
        const elt = document.createElement(tagName);

        if (classList) {
            for (const cls of classList) {
                elt.classList.add(cls);
            }
        }

        return elt;
    }
}
