import ChildComponent from "../../component/ChildComponent";
import DomHandler from "../../DomHandler";
import DOMMutationHandler from "../../DOMMutationHandler";
import EventHandler from "../../EventHandler";
import Globals from "../../Globals";
import { IStore, IStoreColor } from "../../interfaces/IStore";
import ColorStore from "./ColorStore";
import { ActionState, StoreItem } from "./StoreItem";

export default class Store extends ChildComponent {

    private parentElt: HTMLElement;
    private containerElt: HTMLElement;

    private level: number;
    private currency: number;

    private selectedItem: StoreItem | undefined;
    private storeItems: StoreItem[];

    private colorStore: ColorStore;

    constructor(menuElt: HTMLElement) {
        super();

        this.parentElt = DomHandler.getElement(".side-panel-store", menuElt);
        this.containerElt = DomHandler.getElement(".store-container", this.parentElt);

        this.level = 0;
        this.currency = 0;

        this.storeItems = [];

        this.colorStore = new ColorStore(this.level, this.currency);

    }

    public async enable() {
        EventHandler.addListener(this, EventHandler.Event.STORE_ITEM_PURCHASE, this.onPurchase);
        EventHandler.addListener(this, EventHandler.Event.STORE_ITEM_SELECTION, this.onSelection);
        EventHandler.addListener(this, EventHandler.Event.STORE_ITEM_MORE_COLORS, this.onStoreItemCustomization);
        EventHandler.addListener(this, EventHandler.Event.OVERLAY_CLOSE, this.onOverlayClose);

        const token = Globals.getGlobal(Globals.Global.AUTH_TOKEN);
        DOMMutationHandler.show(this.parentElt);
        if (token) {
            const store = await this.getStore(token);
            console.log(store);

            this.colorStore.updateColors(store.colors);
            this.renderStore(store);
        }

    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.STORE_ITEM_PURCHASE, this.onPurchase);
        EventHandler.removeListener(this, EventHandler.Event.STORE_ITEM_SELECTION, this.onSelection);
        EventHandler.removeListener(this, EventHandler.Event.STORE_ITEM_MORE_COLORS, this.onStoreItemCustomization);
        EventHandler.removeListener(this, EventHandler.Event.OVERLAY_CLOSE, this.onOverlayClose);

        for (const storeItem of this.storeItems) {
            this.detachChild(storeItem);
        }

        this.storeItems = [];
        this.selectedItem = undefined;

        DOMMutationHandler.clear(this.containerElt);
        DOMMutationHandler.hide(this.parentElt);

    }

    public updateStats(level: number, currency: number) {
        this.level = level;
        this.currency = currency;

        for (const storeItem of this.storeItems) {
            storeItem.updateStats(level, currency);
        }

        this.colorStore.updateStats(level, currency);
    }

    private async onPurchase(storeItem: StoreItem) {
        // todo: are you sure?
        const token = Globals.getGlobal(Globals.Global.AUTH_TOKEN);
        if (token) {
            const requestStatus = await this.postStore(token, "purchase", storeItem.title);
            if (requestStatus === 200) {
                storeItem.updateAction(ActionState.SELECT);
            } else {
                alert("Error purchasing store item: " + requestStatus + ". Please report this.");
            }
        }
    }

    private async onSelection(storeItem: StoreItem) {
        const token = Globals.getGlobal(Globals.Global.AUTH_TOKEN);
        if (token) {
            const requestStatus = await this.postStore(token, "selection", storeItem.title);
            if (requestStatus === 200) {
                if (this.selectedItem) {
                    this.selectedItem.updateAction(ActionState.SELECT);
                }

                storeItem.updateAction(ActionState.SELECTED);
                this.selectedItem = storeItem;
            } else {
                alert("Error selecting store item: " + requestStatus + ". Please report this.");
            }
        }
    }

    private onStoreItemCustomization(storeItem: StoreItem) {
        this.colorStore.update(storeItem);
        this.attachChild(this.colorStore);
    }

    private onOverlayClose() {
        this.detachChild(this.colorStore);
    }

    private renderStore(store: IStore) {
        for (const [title, tank] of store.tanks) {

            const storeItem = new StoreItem(tank, title, store.colors, this.level, this.currency);
            this.storeItems.push(storeItem);
            this.attachChild(storeItem);

            this.containerElt.appendChild(storeItem.getElement());

            if (tank.selected) {
                this.selectedItem = storeItem;
            }
        }
    }

    private async getStore(token: string) {
        const storeData = await this.postStore(token);

        const store: any = {};
        store.colors = new Map(Object.entries(storeData.colors));
        store.tanks = new Map(Object.entries(storeData.tanks));

        return store;
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
        if (key && title) {
            return response.status;
        }
        return response.json();
    }
}
