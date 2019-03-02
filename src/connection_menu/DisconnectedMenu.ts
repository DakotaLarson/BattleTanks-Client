import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

export default class DisconnectedScreen extends Component {

    private element: HTMLElement;
    private disconnectElt: HTMLElement;
    private reasonElt: HTMLElement;

    constructor(parent: HTMLElement) {
        super();
        this.element = DomHandler.getElement(".section-disconnected", parent);
        this.disconnectElt = DomHandler.getElement(".option-disconnect", this.element);
        this.reasonElt = DomHandler.getElement(".disconnected-reason", this.element);

    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onDisconnect);
        EventHandler.addListener(this, EventHandler.Event.MULTIPLAYER_CONNECTION_WS_CLOSE_REASON, this.onReason);

        this.element.style.display = "block";
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onDisconnect);
        EventHandler.removeListener(this, EventHandler.Event.MULTIPLAYER_CONNECTION_WS_CLOSE_REASON, this.onReason);

        this.reasonElt.textContent = "";
        this.element.style.display = "";
    }

    private onDisconnect(event: MouseEvent) {
        if (event.target === this.disconnectElt) {
            EventHandler.callEvent(EventHandler.Event.MULTIPLAYER_DISCONNECT_REQUEST);
        }
    }

    private onReason(reason: string) {
        this.reasonElt.textContent = reason;
    }
}
