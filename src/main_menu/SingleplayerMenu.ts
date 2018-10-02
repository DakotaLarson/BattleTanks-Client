import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

export default class SingleplayerMenu extends Component {

    public element: HTMLElement;
    public createBtn: HTMLElement;
    public loadBtn: HTMLElement;
    public cancelBtn: HTMLElement;

    constructor(mainMenu: HTMLElement) {
        super();
        this.element = DomHandler.getElement("#main-menu-sp", mainMenu);

        // Buttons
        this.createBtn = DomHandler.getElement("#sp-opt-create", mainMenu);
        this.loadBtn = DomHandler.getElement("#sp-opt-load", mainMenu);
        this.cancelBtn = DomHandler.getElement("#sp-opt-cancel", mainMenu);

    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.handleCancelOption);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.handleCreateOption);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.handleLoadOption);

        this.element.style.display = "block";
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.handleCancelOption);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.handleCreateOption);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.handleLoadOption);
        this.element.style.display = "";
    }

    // Click Handlers

    public handleCreateOption(event: MouseEvent) {
        if (event.target === this.createBtn) {
            EventHandler.callEvent(EventHandler.Event.SPMENU_CREATE_OPT_CLICK);
        }
    }

    public handleLoadOption(event: MouseEvent) {
        if (event.target === this.loadBtn) {
            EventHandler.callEvent(EventHandler.Event.SPMENU_LOAD_OPT_CLICK);
        }
    }

    public handleCancelOption(event: MouseEvent) {
        if (event.target === this.cancelBtn) {
            EventHandler.callEvent(EventHandler.Event.SPMENU_CANCEL_OPT_CLICK);
        }
    }
}
