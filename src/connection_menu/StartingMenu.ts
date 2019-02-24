import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

export default class StartingScreen extends Component {

    private element: HTMLElement;
    private disconnectElt: HTMLElement;

    private lastMatchStatisticsElt: HTMLElement;

    constructor(parent: HTMLElement) {
        super();
        this.element = DomHandler.getElement(".section-starting", parent);
        this.disconnectElt = DomHandler.getElement(".option-disconnect", this.element);
        this.lastMatchStatisticsElt = DomHandler.getElement(".last-match-statistics", this.element);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onDisconnect);
        this.element.style.display = "block";
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onDisconnect);
        this.element.style.display = "";
        this.clearStats();
    }

    public updateStatistics(elt: HTMLElement) {
        this.clearStats();
        this.lastMatchStatisticsElt.appendChild(elt);
    }

    private onDisconnect(event: MouseEvent) {
        if (event.target === this.disconnectElt) {
            EventHandler.callEvent(EventHandler.Event.CONNECTION_MENU_DISCONNECT);
        }
    }

    private clearStats() {
        while (this.lastMatchStatisticsElt.firstChild) {
            this.lastMatchStatisticsElt.removeChild(this.lastMatchStatisticsElt.firstChild);
        }
    }
}
