import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

export default class WaitingScreen extends Component {

    private element: HTMLElement;
    private disconnectElt: HTMLElement;

    private lastMatchStatisticsElt: HTMLElement;

    constructor(parent: HTMLElement) {
        super();
        this.element = DomHandler.getElement(".section-waiting", parent);
        this.disconnectElt = DomHandler.getElement(".option-disconnect", this.element);
        this.lastMatchStatisticsElt = DomHandler.getElement(".last-match-statistics", this.element);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onDisconnect);
        this.element.style.display = "block";
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onDisconnect);
        this.clearStats();
        this.element.style.display = "";
    }

    public updateStatistics(elt: HTMLElement) {
        this.clearStats();
        this.lastMatchStatisticsElt.appendChild(elt);
    }

    private onDisconnect(event: MouseEvent) {
        if (event.target === this.disconnectElt) {
            EventHandler.callEvent(EventHandler.Event.MULTIPLAYER_DISCONNECT_REQUEST);
        }
    }

    private clearStats() {
        while (this.lastMatchStatisticsElt.firstChild) {
            this.lastMatchStatisticsElt.removeChild(this.lastMatchStatisticsElt.firstChild);
        }
    }
}
