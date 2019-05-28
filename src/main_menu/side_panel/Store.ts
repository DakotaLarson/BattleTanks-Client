import ChildComponent from "../../component/ChildComponent";
import DomHandler from "../../DomHandler";
import DOMMutationHandler from "../../DOMMutationHandler";
import EventHandler from "../../EventHandler";
import Globals from "../../Globals";
import { IShopObject, IStore } from "../../interfaces/IStore";

export default class Store extends ChildComponent {

    private parentElt: HTMLElement;
    private containerElt: HTMLElement;

    private level: number;
    private currency: number;

    private selectionOptions: Map<HTMLElement, string>;
    private purchaseOptions: Map<HTMLElement, string>;

    constructor(menuElt: HTMLElement) {
        super();

        this.parentElt = DomHandler.getElement(".side-panel-store", menuElt);
        this.containerElt = DomHandler.getElement(".store-container", this.parentElt);

        this.level = 0;
        this.currency = 0;

        this.selectionOptions = new Map();
        this.purchaseOptions = new Map();
    }

    public async enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onClick);

        const token = Globals.getGlobal(Globals.Global.AUTH_TOKEN);
        DOMMutationHandler.show(this.parentElt);
        if (token) {
            const store = await this.getStore(token);
            this.renderStore(store);
        }

    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onClick);

        DOMMutationHandler.clear(this.containerElt);
        DOMMutationHandler.hide(this.parentElt);

        this.selectionOptions.clear();
        this.purchaseOptions.clear();
    }

    public updateStats(level: number, currency: number) {
        this.level = level;
        this.currency = currency;
    }

    private onClick(event: MouseEvent) {
        const elt = event.target as HTMLElement;
        if (elt.classList.contains("store-item-action") && !elt.classList.contains("btn-selected") && !elt.classList.contains("btn-disabled")) {
            const purchaseTitle = this.purchaseOptions.get(elt);
            if (purchaseTitle) {
                this.purchase(purchaseTitle, elt);
            } else {
                const selectionTitle = this.selectionOptions.get(elt);
                if (selectionTitle) {
                    this.select(selectionTitle, elt);
                }
            }
        }
    }

    private async select(title: string, elt: HTMLElement) {
        const token = Globals.getGlobal(Globals.Global.AUTH_TOKEN);
        if (token) {
            await this.postStore(token, "select", title);

            const currentSelectionElt = DomHandler.getElement("#store-item-selected", this.containerElt);
            currentSelectionElt.textContent = "Select";
            currentSelectionElt.classList.remove("btn-selected");
            currentSelectionElt.removeAttribute("id");

            elt.textContent = "Selected";
            elt.classList.add("btn-selected");
            elt.id = "store-item-selected";

        }
    }

    private purchase(title: string, elt: HTMLElement) {
        // todo: are you sure?
        const token = Globals.getGlobal(Globals.Global.AUTH_TOKEN);
        if (token) {
            this.postStore(token, "purchase", title);

            elt.textContent = "Select";
        }
    }

    private renderStore(store: IStore) {
        const elts: HTMLElement[] = [];
        for (const tank of store.tanks) {
            elts.push(this.createStoreItem(tank));
        }
        fastdom.mutate(() => {
            for (const elt of elts) {
                this.containerElt.appendChild(elt);
            }
        });
    }

    private createStoreItem(tank: IShopObject) {
        const parent = this.createElement("div", ["store-item-container"]);

        const titleElt = this.createElement("div", [], tank.title);
        const priceElt = this.createElement("div", ["store-item-price"], "Price: " + (tank.price || "Free"));

        let actionText;
        const actionClassList = ["btn-sml", "store-item-action"];
        let actionId;

        let isPurchase = false;
        let isSelection = false;

        if (tank.selectionIndex > -1) {
            actionText = "Selected";
            actionClassList.push("btn-selected");

            actionId = "shop-item-selected";
            isSelection = true;
        } else if (tank.purchased) {
            actionText = "Select";
            isSelection = true;
        } else {
            actionText = "Buy";
            if (tank.level_required > this.level || tank.price > this.currency) {
                actionClassList.push("btn-disabled");
            } else {
                isPurchase = true;
            }
        }
        const actionElt = this.createElement("span", actionClassList, actionText, actionId);

        parent.appendChild(titleElt);
        parent.appendChild(priceElt);
        parent.appendChild(actionElt);

        if (isSelection) {
            this.selectionOptions.set(actionElt, tank.title);
        }

        if (isPurchase) {
            this.purchaseOptions.set(actionElt, tank.title);
        }

        return parent;
    }

    private createElement(tagName: string, classList?: string[], textContent?: string, id?: string) {
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

    private getStore(token: string) {
        return this.postStore(token);
    }

    private async postStore(token: string, key?: string, title?: string) {
        const address = "http" + Globals.getGlobal(Globals.Global.HOST);
        const body: any = {
            token,
        };
        if (key && title) {
            body[key] = title;
        }
        const rawBody = JSON.stringify(body);

        const response = await fetch(address + "/store", {
            method: "post",
            mode: "cors",
            credentials: "omit",
            body: rawBody,
            headers: {
                "content-type": "application/json",
            },
        });
        return response.json() as unknown as IStore;
    }
}
