import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import Globals from "../Globals";

export default class TopMenu extends Component {

    private element: HTMLElement;
    private spBtn: HTMLElement;
    private mpBtn: HTMLElement;

    private asGuestElt: HTMLElement;

    constructor(mainMenu: HTMLElement) {
        super();
        this.element = DomHandler.getElement("#main-menu-top", mainMenu);

        this.spBtn = DomHandler.getElement("#top-opt-sp", this.element);
        this.mpBtn = DomHandler.getElement("#top-opt-mp", this.element);
        this.asGuestElt = DomHandler.getElement(".play-as-guest", this.element);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onSPOption);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onMPOption);
        EventHandler.addListener(this, EventHandler.Event.SIGN_IN, this.onSignIn);
        EventHandler.addListener(this, EventHandler.Event.SIGN_OUT, this.onSignOut);

        if (!Globals.getGlobal(Globals.Global.AUTH_TOKEN)) {
            this.asGuestElt.style.display = "block";
        }
        this.element.style.display = "block";
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onSPOption);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onMPOption);
        EventHandler.removeListener(this, EventHandler.Event.SIGN_IN, this.onSignIn);
        EventHandler.removeListener(this, EventHandler.Event.SIGN_OUT, this.onSignOut);

        this.asGuestElt.style.display = "";
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
            EventHandler.callEvent(EventHandler.Event.MPMENU_JOIN_OPT_CLICK);
        }
    }

    private onSignIn() {
        this.asGuestElt.style.display = "";
    }

    private onSignOut() {
        this.asGuestElt.style.display = "block";
    }
}
