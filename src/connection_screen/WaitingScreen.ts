import Component from "../component/ChildComponent";
import DomEventHandler from "../DomEventHandler";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

export default class WaitingScreen extends Component {

    public element: HTMLElement;
    public disconnectElt: HTMLElement;

    constructor(parent: HTMLElement) {
        super();
        this.element = DomHandler.getElement(".section-waiting", parent);
        this.disconnectElt = DomHandler.getElement(".option-disconnect", this.element);

    }

    public enable() {
        DomEventHandler.addListener(this, this.disconnectElt, "click", this.onDisconnect);
        this.element.style.display = "block";
    }

    public disable() {
        DomEventHandler.removeListener(this, this.disconnectElt, "click", this.onDisconnect);
        this.element.style.display = "";
    }

    public onDisconnect() {
        EventHandler.callEvent(EventHandler.Event.CONNECTION_SCREEN_DISCONNECT);
    }
}
