import ChildComponent from "../../../component/ChildComponent";
import DomHandler from "../../../DomHandler";
import EventHandler from "../../../EventHandler";
import Overlay from "../../overlay/Overlay";
import CreateMenu from "./CreateMenu";
import LoadMenu from "./LoadMenu";

export default class ArenaCreator extends ChildComponent {

    private parentElt: HTMLElement;

    private topMenu: HTMLElement;
    private createTutorialLink: HTMLElement;

    private createMenu: CreateMenu;
    private loadMenu: LoadMenu;

    private lastAttachedCmp: ChildComponent | undefined;

    private createBtn: HTMLElement;
    private loadBtn: HTMLElement;

    private tutorial: Overlay | undefined;

    constructor(menuElt: HTMLElement) {
        super();

        this.parentElt = DomHandler.getElement(".side-panel-creator", menuElt);
        this.createTutorialLink = DomHandler.getElement("#create-tutorial-link", this.parentElt);

        this.topMenu = DomHandler.getElement(".side-panel-creator-section-top", this.parentElt);

        this.createMenu = new CreateMenu(this.parentElt);
        this.loadMenu = new LoadMenu(this.parentElt);

        this.createBtn = DomHandler.getElement(".side-panel-creator-create", this.topMenu);
        this.loadBtn = DomHandler.getElement(".side-panel-creator-load", this.topMenu);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK_PRIMARY, this.onCreateClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK_PRIMARY, this.onLoadClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK_PRIMARY, this.onCreateTutorialClick);
        EventHandler.addListener(this, EventHandler.Event.OVERLAY_CLOSE, this.onTutorialClose);

        this.attach(undefined);

        this.parentElt.style.display = "block";
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK_PRIMARY, this.onCreateClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK_PRIMARY, this.onLoadClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK_PRIMARY, this.onCreateTutorialClick);
        EventHandler.removeListener(this, EventHandler.Event.OVERLAY_CLOSE, this.onTutorialClose);

        this.parentElt.style.display = "";
    }

    private onCreateClick(event: MouseEvent) {
        if (event.target === this.createBtn) {
            this.attach(this.createMenu);
        }
    }

    private onLoadClick(event: MouseEvent) {
        if (event.target === this.loadBtn) {
            this.attach(this.loadMenu);
        }
    }

    private onCreateTutorialClick(event: MouseEvent) {
        if (event.target === this.createTutorialLink) {
            this.openTutorial(".overlay-create");
        }
    }

    private onTutorialClose() {
        if (this.tutorial) {
            this.detachChild(this.tutorial);
            this.tutorial = undefined;
        }
    }

    private openTutorial(contentQuery: string) {
        if (this.tutorial) {
            this.detachChild(this.tutorial);
        }
        this.tutorial = new Overlay(contentQuery);
        this.attachChild(this.tutorial);
    }

    private attach(cmp: ChildComponent | undefined) {
        if (cmp) {
            this.attachChild(cmp);
            this.topMenu.style.display = "";
            this.lastAttachedCmp = cmp;
        } else {
            this.topMenu.style.display = "block";
            if (this.lastAttachedCmp) {
                this.detachChild(this.lastAttachedCmp);
                this.lastAttachedCmp = undefined;
            }
        }
    }
}
