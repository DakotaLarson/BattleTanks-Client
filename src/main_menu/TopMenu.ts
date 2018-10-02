import Component from "../component/ChildComponent";
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
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.handleSPOption);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.handleMPOption);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.handleOptOption);

        this.element.style.display = "block";
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.handleSPOption);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.handleMPOption);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.handleOptOption);

        this.element.style.display = "";
    }

    // Click Handlers
    public handleSPOption(event: MouseEvent) {
        if (event.target === this.spBtn) {
            EventHandler.callEvent(EventHandler.Event.TOPMENU_SP_OPT_CLICK);
        }
    }

    public handleMPOption(event: MouseEvent) {
        if (event.target === this.mpBtn) {
            EventHandler.callEvent(EventHandler.Event.TOPMENU_MP_OPT_CLICK);
        }
    }

    public handleOptOption(event: MouseEvent) {
        if (event.target === this.optBtn) {
            EventHandler.callEvent(EventHandler.Event.TOPMENU_OPT_OPT_CLICK);
        }
    }
}
