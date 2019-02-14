import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import Globals from "../Globals";

export default class Leaderboard extends ChildComponent {

    private messageElt: HTMLElement;
    private containerElt: HTMLElement;
    private rankElt: HTMLElement;

    constructor(menuElt: HTMLElement) {
        super();

        this.messageElt = DomHandler.getElement(".leaderboard-message", menuElt);
        this.containerElt = DomHandler.getElement(".leaderboard-container", menuElt);
        this.rankElt = DomHandler.getElement(".leaderboard-rank-container", menuElt);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.SIGN_IN, this.onSignIn);
        EventHandler.addListener(this, EventHandler.Event.SIGN_OUT, this.onSignOut);

        this.getLeaderboard(2);
        const authToken = Globals.getGlobal(Globals.Global.AUTH_TOKEN);
        if (authToken) {
            this.getLeaderboardRank(authToken);
        }
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.SIGN_IN, this.onSignIn);
        EventHandler.removeListener(this, EventHandler.Event.SIGN_OUT, this.onSignOut);
        this.clearLeaderboard();
        this.clearLeaderboardRank();
    }

    private onSignIn(token: string) {
        this.getLeaderboardRank(token);
    }

    private onSignOut() {
        this.clearLeaderboardRank();
    }

    private clearLeaderboard() {
        while (this.containerElt.firstChild) {
            this.containerElt.removeChild(this.containerElt.firstChild);
        }
        this.messageElt.textContent = "";
    }

    private clearLeaderboardRank() {
        this.rankElt.textContent = "";
    }

    private getLeaderboard(leaderboard: number) {
        this.clearLeaderboard();
        this.messageElt.textContent = "Loading...";
        this.retrieveLeaderboard(leaderboard).then((data) => {
            this.renderLeaderboard(data);
            this.messageElt.textContent = "";
        }).catch((err) => {
            console.error(err);
        });
    }

    private getLeaderboardRank(token: string) {
        this.rankElt.textContent = "Loading...";
        this.retrieveLeaderboardRank(2, token).then((rank) => {
            this.rankElt.textContent = "Your rank: " + rank;
        }).catch((err) => {
            console.error(err);
            this.rankElt.textContent = "Internal error";
        });
    }

    private renderLeaderboard(data: any) {
        for (const entry of data) {
            const titleElt = this.createLeaderboardElt(entry.username, true);
            const dataElt = this.createLeaderboardElt(entry.points, false);
            this.containerElt.appendChild(titleElt);
            this.containerElt.appendChild(dataElt);
        }
    }

    private createLeaderboardElt(text: string, isTitle: boolean) {
        const element = document.createElement("div");
        if (isTitle) {
            element.textContent = text + ":";
            element.classList.add("leaderboard-entry", "leaderboard-entry-title");
        } else {
            element.textContent = text;
            element.classList.add("leaderboard-entry");
        }
        return element;
    }

    private retrieveLeaderboard(leaderboard: number) {
        return new Promise((resolve, reject) => {
            const address = "http" + Globals.getGlobal(Globals.Global.HOST);
            const body = JSON.stringify({
                leaderboard,
            });

            fetch(address + "/leaderboard", {
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
        });
    }

    private retrieveLeaderboardRank(leaderboard: number, token: string) {
        return new Promise((resolve, reject) => {
            const address = "http" + Globals.getGlobal(Globals.Global.HOST);
            const body = JSON.stringify({
                leaderboard,
                token,
            });
            fetch(address + "/leaderboardrank", {
                method: "post",
                mode: "cors",
                credentials: "omit",
                body,
                headers: {
                    "content-type": "application/json",
                },
            }).then((response: Response) => {
                return response.text();
            }).then((rank: any) => {
                if (isNaN(rank)) {
                    reject("Response is not a number: " + rank);
                } else {
                    resolve(rank);
                }
            }).catch((err) => {
                reject(err);
            });
        });
    }
}
