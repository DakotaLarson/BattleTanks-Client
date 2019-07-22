import DomHandler from "../../DomHandler";
import EventHandler from "../../EventHandler";
import { IStoreObject } from "../../interfaces/IStore";
import Overlay from "../overlay/Overlay";
import { StoreItem } from "./StoreItem";
import StoreUtils from "./StoreUtils";

export default class ColorStore extends Overlay {

    private level: number;
    private currency: number;

    private titleElt: HTMLElement;
    private containerElt: HTMLElement;
    private currencyElt: HTMLElement;

    private actionsByTitles: Map<string, HTMLElement>;
    private colorsByTitles: Map<string, IStoreObject>;

    constructor(level: number, currency: number) {
        super(".overlay-color");

        this.level = level;
        this.currency = currency;

        this.titleElt = DomHandler.getElement(".overlay-color-title", this.contentElt);
        this.containerElt = DomHandler.getElement(".overlay-color-container", this.contentElt);
        this.currencyElt = DomHandler.getElement(".store-currency", this.contentElt);

        this.actionsByTitles = new Map();
        this.colorsByTitles = new Map();
    }

    public enable() {
        super.enable();

        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK_PRIMARY, this.onClick);
    }

    public disable() {
        super.disable();

        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK_PRIMARY, this.onClick);
    }

    public updateColors(colors: Map<string, IStoreObject>) {

        while (this.containerElt.firstChild) {
            this.containerElt.removeChild(this.containerElt.firstChild);
        }
        this.actionsByTitles.clear();
        this.colorsByTitles.clear();

        for (const [title, color] of colors) {

            let actionElt;
            if (color.price > this.currency || color.level_required > this.level) {
                actionElt = this.createActionElt("Purchase", false, true);
            } else {
                actionElt = this.createActionElt("Purchase", false, false);
            }

            const colorElt = this.createParentElt(title, color.detail, actionElt, color.price);
            this.containerElt.appendChild(colorElt);
            this.actionsByTitles.set(title, actionElt);
            this.colorsByTitles.set(title, color);
        }
    }

    public updateStats(level: number, currency: number) {
        this.level = level;
        this.currency = currency;

        this.currencyElt.textContent = "Currency: " + this.currency;

        for (const [title, color] of this.colorsByTitles) {
            const actionElt = this.actionsByTitles.get(title)!;

            if (!actionElt.classList.contains("btn-selected")) {
                if (color.price > this.currency || color.level_required >= this.level) {
                    actionElt.classList.add("btn-disabled");
                } else {
                    actionElt.classList.remove("btn-disabled");
                }
            }
        }
    }

    public update(storeItem: StoreItem) {

        for (const [, actionElt] of this.actionsByTitles) {
            actionElt.classList.remove("btn-selected", "btn-disabled");
            actionElt.textContent = "Purchase";
        }

        this.titleElt.textContent = "Colors for '" + storeItem.title + "'";

        for (const purchasedColor of storeItem.purchasedColors) {
            const actionElt = this.actionsByTitles.get(purchasedColor);
            if (actionElt) {
                actionElt.classList.add("btn-selected");
                actionElt.textContent = "Purchased";
            }
        }

        for (const [title, actionElt] of this.actionsByTitles) {
            if (storeItem.purchasedColors.includes(title)) {
                actionElt.classList.remove("btn-disabled");
                actionElt.classList.add("btn-selected");
                actionElt.textContent = "Purchased";
            } else {
                actionElt.classList.remove("btn-selected");
                actionElt.textContent = "Purchase";

                const color = this.colorsByTitles.get(title)!;
                if (color.price > this.currency || color.level_required > this.level) {
                    actionElt.classList.add("btn-disabled");
                } else {
                    actionElt.classList.remove("btn-disabled");
                }
            }
        }
    }

    public handlePurchase(title: string) {
        const actionElt = this.actionsByTitles.get(title);
        if (actionElt) {
            actionElt.classList.add("btn-selected");
            actionElt.textContent = "Purchased";
        }
    }

    private onClick(event: MouseEvent) {
        const target = event.target as HTMLElement;

        if (target.classList.contains("btn-sml") && !target.classList.contains("btn-selected") && !target.classList.contains("btn-disabled")) {
            for (const [title, actionElt] of this.actionsByTitles) {
                if (target === actionElt) {
                    EventHandler.callEvent(EventHandler.Event.STORE_ITEM_MORE_COLORS_PURCHASE, title);
                }
            }
        }
    }

    private createParentElt(title: string, detail: string, actionElt: HTMLElement, price: number) {
        const colorContainerElt = StoreUtils.createElement("div", ["store-item-custom-color-container"]);
        const colorElt = StoreUtils.createColorElt(title, detail);

        const currencyElt = StoreUtils.createElement("div", ["store-item-custom-color-price"], "Price: " + price);

        const actionParentElt = StoreUtils.createElement("div", ["store-item-custom-color-parent"]);
        actionParentElt.appendChild(actionElt);
        actionParentElt.appendChild(currencyElt);

        colorContainerElt.appendChild(colorElt);
        colorContainerElt.appendChild(actionParentElt);

        return colorContainerElt;
    }

    private createActionElt(text: string, selected: boolean, disabled: boolean) {
        const actionClassList = ["btn-sml"];

        if (selected) {
            actionClassList.push("btn-selected");
        } else if (disabled) {
            actionClassList.push("btn-disabled");
        }

        return  StoreUtils.createElement("div", actionClassList, text);
    }
}
