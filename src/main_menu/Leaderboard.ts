import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import Globals from "../Globals";

export default class Leaderboard extends ChildComponent {

    private static readonly SELECTION_COOLDOWN = 1000;

    private messageElt: HTMLElement;
    private containerElt: HTMLElement;
    private rankElt: HTMLElement;

    private selection1Elt: HTMLElement;
    private selection2Elt: HTMLElement;
    private selection3Elt: HTMLElement;
    private selection4Elt: HTMLElement;

    private selectedElt: HTMLElement;
    private selectedLeaderboard: number;
    private lastSelectionTime: number;

    constructor(menuElt: HTMLElement) {
        super();

        this.messageElt = DomHandler.getElement(".leaderboard-message", menuElt);
        this.containerElt = DomHandler.getElement(".leaderboard-container", menuElt);
        this.rankElt = DomHandler.getElement(".leaderboard-rank-container", menuElt);

        this.selection1Elt = DomHandler.getElement("#leaderboard-selection-1");
        this.selection2Elt = DomHandler.getElement("#leaderboard-selection-2");
        this.selection3Elt = DomHandler.getElement("#leaderboard-selection-3");
        this.selection4Elt = DomHandler.getElement("#leaderboard-selection-4");

        this.selectedElt = this.selection1Elt;
        this.selectedLeaderboard = 1;
        this.lastSelectionTime = performance.now();

        this.selection1Elt.classList.add("leaderboard-selection-selected");
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.SIGN_IN, this.onSignIn);
        EventHandler.addListener(this, EventHandler.Event.SIGN_OUT, this.onSignOut);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onClick);

        this.updateLeaderboards();
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.SIGN_IN, this.onSignIn);
        EventHandler.removeListener(this, EventHandler.Event.SIGN_OUT, this.onSignOut);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onClick);
        this.clearLeaderboard();
        this.clearLeaderboardRank();

        this.selectedLeaderboard = 1;
        this.updateSelectedElement(this.selection1Elt);
    }

    private onSignIn(token: string) {
        this.getLeaderboardRank(token);
    }

    private onSignOut() {
        this.clearLeaderboardRank();
    }

    private onClick(event: MouseEvent) {
        if (performance.now() - this.lastSelectionTime > Leaderboard.SELECTION_COOLDOWN && event.target !== this.selectedElt) {
            if (event.target === this.selection1Elt) {
                this.selectedLeaderboard = 1;
                this.updateLeaderboards();
                this.updateSelectedElement(this.selection1Elt);
            } else if (event.target === this.selection2Elt) {
                this.selectedLeaderboard = 2;
                this.updateLeaderboards();
                this.updateSelectedElement(this.selection2Elt);
            } else if (event.target === this.selection3Elt) {
                this.selectedLeaderboard = 3;
                this.updateLeaderboards();
                this.updateSelectedElement(this.selection3Elt);
            } else if (event.target === this.selection4Elt) {
                this.selectedLeaderboard = 4;
                this.updateLeaderboards();
                this.updateSelectedElement(this.selection4Elt);
            }
        }
    }

    private updateLeaderboards() {
        this.lastSelectionTime = performance.now();
        this.getLeaderboard();
        const authToken = Globals.getGlobal(Globals.Global.AUTH_TOKEN);
        if (authToken) {
            this.getLeaderboardRank(authToken);
        }
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

    private getLeaderboard() {
        this.clearLeaderboard();
        this.messageElt.textContent = "Loading...";
        this.retrieveLeaderboard(this.selectedLeaderboard).then((data) => {
            this.renderLeaderboard(data);
            this.messageElt.textContent = "";
        }).catch((err) => {
            console.error(err);
        });
    }

    private getLeaderboardRank(token: string) {
        this.rankElt.textContent = "Loading...";
        this.retrieveLeaderboardRank(this.selectedLeaderboard, token).then((rank) => {
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

    private updateSelectedElement(element: HTMLElement) {
        this.selectedElt.classList.remove("leaderboard-selection-selected");
        this.selectedElt = element;
        element.classList.add("leaderboard-selection-selected");
    }
}
