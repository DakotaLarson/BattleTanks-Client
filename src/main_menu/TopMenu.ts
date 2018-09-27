import Component from "../component/ChildComponent";
import DomEventHandler from "../DomEventHandler";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

export default class TopMenu extends Component {

    public element: HTMLElement;
    public spBtn: HTMLElement;
    public mpBtn: HTMLElement;
    public optBtn: HTMLElement;

    constructor(mainMenu: HTMLElement) {
    super();
    this.element = DomHandler.getElement("#main-menu-top", mainMenu);

        // Buttons
    this.spBtn = DomHandler.getElement("#top-opt-sp", mainMenu);
    this.mpBtn = DomHandler.getElement("#top-opt-mp", mainMenu);
    this.optBtn = DomHandler.getElement("#top-opt-opt", mainMenu);
    }

    public enable() {
        DomEventHandler.addListener(this, this.spBtn, "click", this.handleSPOption);
        DomEventHandler.addListener(this, this.mpBtn, "click", this.handleMPOption);
        DomEventHandler.addListener(this, this.optBtn, "click", this.handleOptOption); this.element.style.display = "block";
    }

    public disable() {
        DomEventHandler.removeListener(this, this.spBtn, "click", this.handleSPOption);
        DomEventHandler.removeListener(this, this.mpBtn, "click", this.handleMPOption);
        DomEventHandler.removeListener(this, this.optBtn, "click", this.handleOptOption);
        this.element.style.display = "";
    }

    // Click Handlers
    public handleSPOption() {
        EventHandler.callEvent(EventHandler.Event.TOPMENU_SP_OPT_CLICK);
    }

    public handleMPOption() {
        EventHandler.callEvent(EventHandler.Event.TOPMENU_MP_OPT_CLICK);
    }

    public handleOptOption() {
        EventHandler.callEvent(EventHandler.Event.TOPMENU_OPT_OPT_CLICK);
    }
}
