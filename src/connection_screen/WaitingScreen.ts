import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

export default class WaitingScreen extends Component {

    private element: HTMLElement;
    private disconnectElt: HTMLElement;

    constructor(parent: HTMLElement) {
        super();
        this.element = DomHandler.getElement(".section-waiting", parent);
        this.disconnectElt = DomHandler.getElement(".option-disconnect", this.element);

    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onDisconnect);
        this.element.style.display = "block";
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onDisconnect);
        this.element.style.display = "";
    }

    private onDisconnect(event: MouseEvent) {
        if (event.target === this.disconnectElt) {
            EventHandler.callEvent(EventHandler.Event.CONNECTION_SCREEN_DISCONNECT);
        }
    }
}
