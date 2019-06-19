import ChildComponent from "../../component/ChildComponent";
import EventHandler from "../../EventHandler";
import Dropdown from "../../gui/Dropdown";
import { IStoreColor, IStoreTank } from "../../interfaces/IStore";
import StoreUtils from "./StoreUtils";

export enum ActionState {
    SELECTED,
    PURCHASE,
    SELECT,
    DISABLED,
}

export class StoreItem extends ChildComponent {

    public title: string;
    public price: number;

    public purchasedColors: string[];

    private level: number;
    private currency: number;

    private levelRequired: number;
    private currencyRequired: number;

    private actionState: ActionState;
    private customizationOpen: boolean;

    private dropdowns: Dropdown[];

    private parentElt: HTMLElement;
    private actionElt: HTMLElement;
    private colorIconElt: HTMLElement;
    private customizationElt: HTMLElement;
    private moreColorsElt: HTMLElement;

    constructor(tank: IStoreTank, title: string, colors: Map<string, IStoreColor>, level: number, currency: number) {
        super();

        this.title = title;
        this.price = tank.price;

        this.purchasedColors = tank.purchasedColors;

        this.level = level;
        this.currency = currency;

        this.levelRequired = tank.level_required;
        this.currencyRequired = tank.price;

        if (tank.selected) {
            this.actionState = ActionState.SELECTED;
        } else if (tank.purchased) {
            this.actionState = ActionState.SELECT;
        } else if (this.canPurchase()) {
            this.actionState = ActionState.PURCHASE;
        } else {
            this.actionState = ActionState.DISABLED;
        }

        this.customizationOpen = false;

        this.dropdowns = [];

        this.actionElt = this.createActionElt();
        this.colorIconElt = this.createColorIconElt();
        this.customizationElt = this.createCustomizationElt(tank, colors);

        this.moreColorsElt = this.createMoreColorsElt();
        this.customizationElt.appendChild(this.moreColorsElt);

        this.parentElt = this.createStoreItem(tank, title, this.actionElt, this.colorIconElt, this.customizationElt);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onClick);
        EventHandler.addListener(this, EventHandler.Event.DROPDOWN_UPDATE, this.onDropdownUpdate);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onClick);
        EventHandler.removeListener(this, EventHandler.Event.DROPDOWN_UPDATE, this.onDropdownUpdate);
    }

    public getElement() {
        return this.parentElt;
    }

    public addColor(title: string, detail: string) {
        const colorElt = this.createStoreItemColorElt(title, detail);
        for (const dropdown of this.dropdowns) {
            dropdown.addValue(colorElt, title);
        }
    }

    public updateStats(level: number, currency: number) {
        this.level = level;
        this.currency = currency;

        if (this.actionState === ActionState.DISABLED || this.actionState === ActionState.PURCHASE) {
            const previousState = this.actionState;

            if (this.canPurchase()) {
                this.actionState = ActionState.PURCHASE;
            } else {
                this.actionState = ActionState.DISABLED;
            }

            if (previousState !== this.actionState) {
                const actionElt = this.createActionElt();
                this.parentElt.replaceChild(actionElt, this.actionElt);
                this.actionElt = actionElt;
            }
        }
    }

    public updateAction(state: ActionState) {
        this.actionState = state;
        const actionElt = this.createActionElt();

        this.parentElt.replaceChild(actionElt, this.actionElt);
        this.actionElt = actionElt;

        if (state === ActionState.SELECTED) {
            this.colorIconElt.style.display = "block";
        } else {
            this.colorIconElt.style.display = "";
        }
    }

    private onClick(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (this.customizationOpen) {

            if (target === this.moreColorsElt || !this.customizationElt.contains(target)) {
                this.updateCustomizationVisibility(false);

                if (target === this.moreColorsElt) {
                    EventHandler.callEvent(EventHandler.Event.STORE_ITEM_MORE_COLORS_VIEW);
                }
            }

        } else {

            if (target === this.actionElt) {
                this.handleActionClick();
            } else if (target === this.colorIconElt) {
                this.updateCustomizationVisibility(true);
            }

        }
    }

    private onDropdownUpdate(event: any) {

        const index = this.dropdowns.findIndex((dropdown) => {
            return dropdown.getId() === event.dropdown;
        });

        if (index > -1) {
            EventHandler.callEvent(EventHandler.Event.STORE_ITEM_COLOR_SELECTION, {
                id: event.id,
                index,
                item: this,
            });
        }
    }

    private handleActionClick() {
        if (this.actionState === ActionState.SELECT) {
            EventHandler.callEvent(EventHandler.Event.STORE_ITEM_SELECTION, this);
        } else if (this.actionState === ActionState.PURCHASE) {
            EventHandler.callEvent(EventHandler.Event.STORE_ITEM_PURCHASE, this);
        }
    }

    private updateCustomizationVisibility(isOpen: boolean) {
        this.customizationElt.style.display = isOpen ? "block" : "";
        this.customizationOpen = isOpen;
    }

    private createStoreItem(tank: IStoreTank, title: string, actionElt: HTMLElement, colorIconElt: HTMLElement, customizationElt: HTMLElement) {
        const parent = StoreUtils.createElement("div", ["store-item-container"]);

        const titleElt = StoreUtils.createElement("div", [], title);
        const priceElt = StoreUtils.createElement("div", ["store-item-price"], "Price: " + (tank.price || "Free"));

        parent.appendChild(titleElt);
        parent.appendChild(priceElt);
        parent.appendChild(actionElt);
        parent.appendChild(colorIconElt);
        parent.appendChild(customizationElt);

        return parent;
    }

    private createActionElt() {
        let actionText;
        const actionClassList = ["btn-sml", "store-item-action"];

        if (this.actionState === ActionState.SELECTED) {
            actionText = "Selected";
            actionClassList.push("btn-selected");
        } else if (this.actionState === ActionState.DISABLED) {
            actionText = "Purchase";
            actionClassList.push("btn-disabled");
        } else if (this.actionState === ActionState.PURCHASE) {
            actionText = "Purchase";
        } else if (this.actionState === ActionState.SELECT) {
            actionText = "Select";
        }

        return StoreUtils.createElement("span", actionClassList, actionText);
    }

    private createColorIconElt() {
        const colorElt = StoreUtils.createElement("img", ["store-item-color-icon"]);
        colorElt.setAttribute("src", "./res/menu/color.svg");
        colorElt.setAttribute("title", "Customize");

        if (this.actionState === ActionState.SELECTED) {
            colorElt.style.display = "block";
        }

        return colorElt;
    }
    private createCustomizationElt(tank: IStoreTank, colors: Map<string, IStoreColor>) {

        for (const dropdown of this.dropdowns) {
            this.detachChild(dropdown);
        }
        this.dropdowns = [];

        const containerElt = StoreUtils.createElement("div", ["store-item-custom-container"]);
        for (const selectedColor of tank.selectedColors) {

            const headerElt = this.createStoreItemColorElt(selectedColor, colors.get(selectedColor)!.detail);

            const dropdownColors: Map<HTMLElement, string> = new Map();
            for (const purchasedColor of tank.purchasedColors) {
                const colorElt = this.createStoreItemColorElt(purchasedColor, colors.get(purchasedColor)!.detail);
                dropdownColors.set(colorElt, purchasedColor);
            }

            const dropdown = new Dropdown(dropdownColors, headerElt);
            this.dropdowns.push(dropdown);
            this.attachChild(dropdown);

            containerElt.appendChild(dropdown.getElement());
        }

        return containerElt;
    }

    private createMoreColorsElt() {
        return StoreUtils.createElement("div", ["btn-sml"], "Get more colors!");
    }

    private createStoreItemColorElt(title: string, detail: string) {
        const colorContainerElt = StoreUtils.createElement("div", ["store-item-custom-color-container"]);
        const colorElt = StoreUtils.createColorElt(title, detail);
        const arrowElt = StoreUtils.createArrowElt();

        colorContainerElt.appendChild(colorElt);
        colorContainerElt.appendChild(arrowElt);

        return colorContainerElt;
    }

    private canPurchase() {
        return this.level >= this.levelRequired && this.currency >= this.currencyRequired;
    }
}
