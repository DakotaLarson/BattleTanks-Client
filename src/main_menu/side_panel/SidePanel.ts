import ChildComponent from "../../component/ChildComponent";
import DomHandler from "../../DomHandler";
import EventHandler from "../../EventHandler";
import Globals from "../../Globals";
import RankCalculator from "../../RankCalculator";

export default class SidePanel extends ChildComponent {

    private usernameElt: HTMLElement;
    private levelElt: HTMLElement;
    private rankElt: HTMLElement;

    constructor(parentElt: HTMLElement) {
        super();

        this.usernameElt = DomHandler.getElement(".side-panel-username", parentElt);
        this.levelElt = DomHandler.getElement(".side-panel-level", parentElt);
        this.rankElt = DomHandler.getElement(".side-panel-rank", parentElt);

    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.SIGN_IN, this.onSignIn);
        EventHandler.addListener(this, EventHandler.Event.SIGN_OUT, this.onSignOut);

        const authToken = Globals.getGlobal(Globals.Global.AUTH_TOKEN);
        this.updateStats(authToken);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.SIGN_IN, this.onSignIn);
        EventHandler.removeListener(this, EventHandler.Event.SIGN_OUT, this.onSignOut);
    }

    private onSignIn(token: string) {
        this.updateStats(token);
    }

    private onSignOut() {
        this.updateStats();
    }

    private async updateStats(token?: string) {
        if (token) {
            const stats = await this.retrieveStats(token);
            this.updateRankAndLevel(stats);
        }
    }

    private updateRankAndLevel(stats: any) {
        const data = RankCalculator.getData(stats.points);
        this.rankElt.textContent = data.rank;
        this.levelElt.textContent = data.level;
    }

    private async retrieveStats(authToken: string) {
        const address = "http" + Globals.getGlobal(Globals.Global.HOST);
        const body = JSON.stringify({
            token: authToken,
        });

        try {
            const response = await fetch(address + "/playerstats", {
                method: "post",
                mode: "cors",
                credentials: "omit",
                body,
                headers: {
                    "content-type": "application/json",
                },
            });
            return response.json();
        } catch (err) {
            console.error(err);
        }
    }
}
