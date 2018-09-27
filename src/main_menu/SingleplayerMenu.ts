import Component from "../component/ChildComponent";
import DomEventHandler from "../DomEventHandler";
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
        DomEventHandler.addListener(this, this.createBtn, "click", this.handleCreateOption);
        DomEventHandler.addListener(this, this.loadBtn, "click", this.handleLoadOption);
        DomEventHandler.addListener(this, this.cancelBtn, "click", this.handleCancelOption);
        this.element.style.display = "block";
    }

    public disable() {
        DomEventHandler.removeListener(this, this.createBtn, "click", this.handleCreateOption);
        DomEventHandler.removeListener(this, this.loadBtn, "click", this.handleLoadOption);
        DomEventHandler.removeListener(this, this.cancelBtn, "click", this.handleCancelOption);
        this.element.style.display = "";
    }

    // Click Handlers

    public handleCreateOption() {
        EventHandler.callEvent(EventHandler.Event.SPMENU_CREATE_OPT_CLICK);
    }

    public handleLoadOption() {
        EventHandler.callEvent(EventHandler.Event.SPMENU_LOAD_OPT_CLICK);
    }

    public handleCancelOption() {
        EventHandler.callEvent(EventHandler.Event.SPMENU_CANCEL_OPT_CLICK);
    }
}
