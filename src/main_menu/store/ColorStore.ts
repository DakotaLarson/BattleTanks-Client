import DomHandler from "../../DomHandler";
import EventHandler from "../../EventHandler";
import { IStoreColor } from "../../interfaces/IStore";
import Overlay from "../overlay/Overlay";
import { StoreItem } from "./StoreItem";
import StoreUtils from "./StoreUtils";

export default class ColorStore extends Overlay {

    private level: number;
    private currency: number;

    private titleElt: HTMLElement;
    private containerElt: HTMLElement;

    private colorActionElts: Map<HTMLElement, string>;

    constructor(level: number, currency: number) {
        super(".overlay-color");

        this.level = level;
        this.currency = currency;

        this.titleElt = DomHandler.getElement(".overlay-color-title");
        this.containerElt = DomHandler.getElement(".overlay-color-container");

        this.colorActionElts = new Map();
    }

    public enable() {
        super.enable();

        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onClick);
    }

    public disable() {
        super.disable();

        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onClick);
    }

    public updateColors(colors: Map<string, IStoreColor>) {

        while (this.containerElt.firstChild) {
            this.containerElt.removeChild(this.containerElt.firstChild);
        }
        this.colorActionElts.clear();

        for (const [title, color] of colors) {
            const actionElt = this.createActionElt("Purchase", false, false);
            const colorElt = this.createColorStoreColorElt(title, color.detail, actionElt);
            this.containerElt.appendChild(colorElt);
            this.colorActionElts.set(actionElt, title);
        }
    }

    public updateStats(level: number, currency: number) {
        this.level = level;
        this.currency = currency;
    }

    public update(storeItem: StoreItem) {
        this.titleElt.textContent = "Colors for '" + storeItem.title + "'";
    }

    private onClick(event: MouseEvent) {
        const target = event.target as HTMLElement;

        if (target.classList.contains("btn-sml") && !target.classList.contains("btn-selected") && !target.classList.contains("btn-disabled")) {
            for (const [colorElt, title] of this.colorActionElts) {
                if (colorElt.contains(target)) {
                    console.log(title);
                }
            }
        }
    }

    private createColorStoreColorElt(title: string, detail: string, actionElt: HTMLElement) {
        const colorContainerElt = StoreUtils.createElement("div", ["store-item-custom-color-container"]);
        const colorElt = StoreUtils.createColorElt(title, detail);

        colorContainerElt.appendChild(colorElt);
        colorContainerElt.appendChild(actionElt);

        return colorContainerElt;
    }

    private createActionElt(text: string, selected: boolean, disabled: boolean) {
        const actionClassList = ["btn-sml"];

        if (selected) {
            actionClassList.push("btn-selected");
        } else if (disabled) {
            actionClassList.push("btn-disabled");
        }

        return StoreUtils.createElement("div", actionClassList, text);
    }
}
