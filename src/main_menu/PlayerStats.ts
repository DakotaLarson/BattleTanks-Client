import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import Globals from "../Globals";

export default class PlayerStats extends ChildComponent {

    private statsContainerElt: HTMLElement;
    private statsMessageElt: HTMLElement;

    constructor(menuElt: HTMLElement) {
        super();
        this.statsContainerElt = DomHandler.getElement(".player-stats-container", menuElt);
        this.statsMessageElt = DomHandler.getElement(".player-stats-message", menuElt);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.SIGN_IN, this.onSignIn);
        EventHandler.addListener(this, EventHandler.Event.SIGN_OUT, this.onSignOut);
        this.getStats().then((stats) => {
            this.renderStats(stats);
        });
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.SIGN_IN, this.onSignIn);
        EventHandler.removeListener(this, EventHandler.Event.SIGN_OUT, this.onSignOut);
        this.clearStatsElt();
    }

    private onSignIn(token: string) {
        // get new stats
        this.getStats(token).then((stats) => {
            this.renderStats(stats);
        });
    }

    private onSignOut() {
        this.renderStats(undefined);
    }

    private renderStats(stats: any) {
        if (stats) {
            this.statsMessageElt.textContent = "";
            for (const stat in stats) {
                if (stat) {
                    const titleElt = this.createStatElt(stat, true);
                    const dataElt = this.createStatElt(stats[stat], false);
                    this.statsContainerElt.appendChild(titleElt);
                    this.statsContainerElt.appendChild(dataElt);
                }
            }
        } else {
            this.clearStatsElt();
            this.statsMessageElt.textContent = "Sign in to save your stats";
        }
    }

    private createStatElt(title: string, isTitle: boolean) {
        const element = document.createElement("div");
        if (isTitle) {
            element.textContent = title + ":";
            element.classList.add("player-stat", "player-stat-title");
        } else {
            element.textContent = title;
            element.classList.add("player-stat");
        }
        return element;
    }

    private clearStatsElt() {
        while (this.statsContainerElt.firstChild) {
            this.statsContainerElt.removeChild(this.statsContainerElt.firstChild);
        }
        this.statsMessageElt.textContent = "";
    }
    private getStats(authToken?: string) {
        this.clearStatsElt();
        this.statsMessageElt.textContent = "Loading...";
        return new Promise((resolve, reject) => {
            if (!authToken) {
                authToken = Globals.getGlobal(Globals.Global.AUTH_TOKEN);
            }
            if (authToken) {
                const address = "http" + Globals.getGlobal(Globals.Global.HOST);
                const body = JSON.stringify({
                    token: authToken,
                });

                fetch(address + "/playerstats", {
                    method: "post",
                    mode: "cors",
                    credentials: "omit",
                    body,
                    headers: {
                        "content-type": "application/json",
                    },
                }).then((response: Response) => {
                    return response.json();
                }).then((stats: any) => {
                    resolve(stats);
                }).catch((err) => {
                    reject(err);
                });
            } else {
                resolve();
            }
        });
    }
}
