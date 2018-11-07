import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

export default class TopMenu extends Component {

    private element: HTMLElement;
    private spBtn: HTMLElement;
    private mpBtn: HTMLElement;

    constructor(mainMenu: HTMLElement) {
        super();
        this.element = DomHandler.getElement("#main-menu-top", mainMenu);

        this.spBtn = DomHandler.getElement("#top-opt-sp", this.element);
        this.mpBtn = DomHandler.getElement("#top-opt-mp", this.element);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onSPOption);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onMPOption);

        this.element.style.display = "block";
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onSPOption);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onMPOption);

        this.element.style.display = "";
    }

    // Click Handlers
    private onSPOption(event: MouseEvent) {
        if (event.target === this.spBtn) {
            EventHandler.callEvent(EventHandler.Event.TOPMENU_SP_OPT_CLICK);
        }
    }

    private onMPOption(event: MouseEvent) {
        if (event.target === this.mpBtn) {

            let address = "wss://battle-tanks-server.herokuapp.com";
            if (location.host.startsWith("localhost")) {
                address = "ws://localhost:8000";
            }
            EventHandler.callEvent(EventHandler.Event.MPMENU_JOIN_OPT_CLICK, address);
            // EventHandler.callEvent(EventHandler.Event.TOPMENU_MP_OPT_CLICK);
        }
    }
}
