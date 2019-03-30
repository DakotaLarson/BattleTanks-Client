import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import DOMMutationHandler from "../DOMMutationHandler";
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
        DOMMutationHandler.show(this.element);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onDisconnect);
        DOMMutationHandler.hide(this.element);
        this.clearStats();
    }

    public updateStatistics(elt: HTMLElement) {
        this.clearStats();
        DOMMutationHandler.add(elt, this.lastMatchStatisticsElt);
    }

    private onDisconnect(event: MouseEvent) {
        if (event.target === this.disconnectElt) {
            EventHandler.callEvent(EventHandler.Event.MULTIPLAYER_DISCONNECT_REQUEST);
        }
    }

    private clearStats() {
        DOMMutationHandler.clear(this.lastMatchStatisticsElt);
    }
}
