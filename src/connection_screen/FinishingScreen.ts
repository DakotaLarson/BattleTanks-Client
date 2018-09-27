import Component from "../component/ChildComponent";
import DomEventHandler from "../DomEventHandler";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

export default class FinishingScreen extends Component {

    public element: HTMLElement;
    public disconnectElt: HTMLElement;
    public messageElt: HTMLElement;

    public statsElt: HTMLElement;
    public winnerElt: HTMLElement;

    constructor(parent: HTMLElement) {
        super();
        this.element = DomHandler.getElement(".section-finishing", parent);
        this.disconnectElt = DomHandler.getElement(".option-disconnect", this.element);
        this.messageElt = DomHandler.getElement(".message", this.element);

        this.statsElt = DomHandler.getElement(".stats-parent", this.element);
        this.winnerElt = DomHandler.getElement("#stats-winner", this.statsElt);

    }

    public enable() {
        DomEventHandler.addListener(this, this.disconnectElt, "click", this.onDisconnect);
        EventHandler.addListener(this, EventHandler.Event.MATCH_STATISTICS_RECEPTION, this.onMatchStatsRecv);
        this.element.style.display = "block";
    }

    public disable() {
        DomEventHandler.removeListener(this, this.disconnectElt, "click", this.onDisconnect);
        this.element.style.display = "";
        EventHandler.removeListener(this, EventHandler.Event.MATCH_STATISTICS_RECEPTION, this.onMatchStatsRecv);

        this.messageElt.textContent = "Last match finishing up.";

        this.statsElt.style.display = "";
        this.winnerElt.textContent = "";
    }

    public onDisconnect() {
        EventHandler.callEvent(EventHandler.Event.CONNECTION_SCREEN_DISCONNECT);
    }

    public onMatchStatsRecv(stats: any) {
        const winner = stats.winner;

        this.messageElt.textContent = "Match Complete!";
        this.winnerElt.textContent = winner;
        this.statsElt.style.display = "block";
    }
}
