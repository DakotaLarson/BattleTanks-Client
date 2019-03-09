import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import Globals from "../Globals";

export default class PlayerStats extends ChildComponent {

    private containerElt: HTMLElement;
    private messageElt: HTMLElement;

    constructor(menuElt: HTMLElement) {
        super();
        this.containerElt = DomHandler.getElement(".player-stats-container", menuElt);
        this.messageElt = DomHandler.getElement(".player-stats-message", menuElt);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.SIGN_IN, this.onSignIn);
        EventHandler.addListener(this, EventHandler.Event.SIGN_OUT, this.onSignOut);
        this.retrieveStats();
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.SIGN_IN, this.onSignIn);
        EventHandler.removeListener(this, EventHandler.Event.SIGN_OUT, this.onSignOut);
        this.clearStatsElt();
    }

    private onSignIn(token: string) {
        this.retrieveStats(token);
    }

    private onSignOut() {
        this.renderStats(undefined);
    }

    private retrieveStats(token?: string) {
        this.getStats(token).then((stats) => {
            if (stats) {
                this.formatStats(stats);
            }
            this.renderStats(stats);
        }).catch((err) => {
            console.log(err);
        });
    }

    private renderStats(stats: any) {
        if (stats) {
            this.messageElt.textContent = "";
            const statTitles = ["points", "rank", "victories", "defeats", "V/D", "kills", "deaths", "K/D", "shots", "hits", "accuracy"];
            for (const title of statTitles) {
                if (stats[title] !== undefined) {
                    this.containerElt.appendChild(this.createStatElt(title));
                    this.containerElt.appendChild(this.createStatElt(stats[title]));
                }
            }
        } else {
            this.clearStatsElt();
            this.messageElt.textContent = "Sign in to save your stats";
        }
    }

    private formatStats(stats: any) {
        if (stats.victories !== undefined) {
            let vdRatio = stats.victories;
            if (stats.defeats) {
                vdRatio = Math.round(vdRatio / stats.defeats * 100) / 100;
            }
            stats["V/D"] = vdRatio;
        }
        if (stats.kills !== undefined) {
            let kdRatio = stats.kills;
            if (stats.deaths) {
                kdRatio = Math.round(kdRatio / stats.deaths * 100) / 100;
            }
            stats["K/D"] = kdRatio;
        }
        if (stats.hits !== undefined) {
            let accuracy = stats.hits * 100;
            if (stats.shots) {
                accuracy = Math.round(accuracy / stats.shots);
            }
            stats.accuracy = accuracy + "%";
        }
    }

    private createStatElt(title: string) {
        const element = document.createElement("div");
        element.textContent = title;
        element.classList.add("player-stat");
        return element;
    }

    private clearStatsElt() {
        while (this.containerElt.firstChild) {
            this.containerElt.removeChild(this.containerElt.firstChild);
        }
        this.messageElt.textContent = "";
    }

    private getStats(authToken?: string) {
        this.clearStatsElt();
        this.messageElt.textContent = "Loading...";
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
