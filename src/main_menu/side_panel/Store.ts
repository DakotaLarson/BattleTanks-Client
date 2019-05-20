import ChildComponent from "../../component/ChildComponent";
import DomHandler from "../../DomHandler";
import DOMMutationHandler from "../../DOMMutationHandler";
import Globals from "../../Globals";
import { IShopObject, IStore } from "../../interfaces/IStore";

export default class Store extends ChildComponent {

    private parentElt: HTMLElement;
    private containerElt: HTMLElement;

    private level: number;
    private currency: number;

    constructor(menuElt: HTMLElement) {
        super();

        this.parentElt = DomHandler.getElement(".side-panel-store", menuElt);
        this.containerElt = DomHandler.getElement(".store-container", this.parentElt);

        this.level = 0;
        this.currency = 0;
    }

    public async enable() {
        const token = Globals.getGlobal(Globals.Global.AUTH_TOKEN);
        DOMMutationHandler.show(this.parentElt);
        if (token) {
            const store = await this.getStore(token);
            this.renderStore(store);
        }

    }

    public disable() {
        DOMMutationHandler.clear(this.containerElt);
        DOMMutationHandler.hide(this.parentElt);
    }

    public updateStats(level: number, currency: number) {
        console.log(level);
        this.level = level;
        this.currency = currency;

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
        const priceElt = this.createElement("div", [], "Price: " + tank.price);

        let actionText;
        const actionClassList = ["btn-sml"];
        if (tank.selectionIndex > -1) {
            actionText = "Selected";
            actionClassList.push("btn-selected");
        } else if (tank.purchased) {
            actionText = "Select";
        } else {
            actionText = "Buy";
            if (tank.level_required > this.level || tank.price > this.currency) {
                actionClassList.push("btn-disabled");
            }
        }
        const actionElt = this.createElement("span", actionClassList, actionText);

        parent.appendChild(titleElt);
        parent.appendChild(priceElt);
        parent.appendChild(actionElt);

        return parent;
    }

    private createElement(tagName: string, classList?: string[], textContent?: string) {
        const elt = document.createElement(tagName);

        if (classList) {
            for (const cls of classList) {
                elt.classList.add(cls);
            }
        }

        if (textContent) {
            elt.textContent = textContent;
        }

        return elt;
    }

    private async getStore(token: string) {
        const address = "http" + Globals.getGlobal(Globals.Global.HOST);
        const body = JSON.stringify({
            token,
        });

        const response = await fetch(address + "/store", {
            method: "post",
            mode: "cors",
            credentials: "omit",
            body,
            headers: {
                "content-type": "application/json",
            },
        });
        return response.json() as unknown as IStore;
    }
}
