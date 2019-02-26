import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import Globals from "../Globals";

export default class Leaderboard extends ChildComponent {

    private static readonly SELECTION_COOLDOWN = 1000;

    private messageElt: HTMLElement;
    private containerElt: HTMLElement;

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

        this.selectedLeaderboard = 1;
        this.updateSelectedElement(this.selection1Elt);
    }

    private onSignIn(token: string) {
        this.getLeaderboardRank(token);
    }

    private onSignOut() {
        this.updateLeaderboards();
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
        this.getLeaderboard().then(() => {
            const authToken = Globals.getGlobal(Globals.Global.AUTH_TOKEN);
            if (authToken) {
                this.getLeaderboardRank(authToken);
            }
        });
    }

    private clearLeaderboard() {
        while (this.containerElt.firstChild) {
            this.containerElt.removeChild(this.containerElt.firstChild);
        }
        this.messageElt.textContent = "";
    }

    private getLeaderboard() {
        return new Promise((resolve) => {
            this.clearLeaderboard();
            this.messageElt.textContent = "Loading...";
            this.retrieveLeaderboard(this.selectedLeaderboard).then((data: any) => {
                this.updateLeaderboardTitle(this.selectedLeaderboard, data.lastReset);
                if (data.leaderboard.length) {
                    this.renderLeaderboard(data.leaderboard);
                    this.messageElt.textContent = "";
                } else {
                    this.messageElt.textContent = "No data here";
                }

                resolve();
            }).catch((err) => {
                console.error(err);
                this.messageElt.textContent = "Error";
            });
        });
    }

    private getLeaderboardRank(token: string) {
        this.retrieveLeaderboardRank(this.selectedLeaderboard, token).then((rankData) => {

            let rankElts = this.containerElt.querySelectorAll(".leaderboard-entry-" + rankData.id);

            if (!rankElts.length) {
                if (!this.containerElt.firstChild) {
                    // There is no leaderboard data to compare to.
                    return;
                }
                const numberElt = this.createLeaderboardElt(rankData.rank, rankData.id);
                const usernameElt = this.createLeaderboardElt(rankData.username, rankData.id);
                const dataElt = this.createLeaderboardElt(rankData.points, rankData.id);

                this.containerElt.appendChild(numberElt);
                this.containerElt.appendChild(usernameElt);
                this.containerElt.appendChild(dataElt);

                rankElts = this.containerElt.querySelectorAll(".leaderboard-entry-" + rankData.id);
            }

            for (const rankElt of Array.from(rankElts)) {
                (rankElt as HTMLElement).style.color = "#03c95f";
            }

        }).catch((err) => {
            console.error(err);
        });
    }

    private updateLeaderboardTitle(column: number, lastReset: number) {
        if (column === 1) {
            if (lastReset) {
                this.selection1Elt.textContent = (lastReset + 1) + " Hours";
            } else {
                this.selection1Elt.textContent = "Hour";
            }
        } else if (column === 2) {
            if (lastReset) {
                this.selection2Elt.textContent = (lastReset + 1) + " Weeks";
            } else {
                this.selection2Elt.textContent = "Week";
            }
        } else if (column === 3) {
            if (lastReset) {
                this.selection3Elt.textContent = (lastReset + 1) + " Months";
            } else {
                this.selection3Elt.textContent = "Month";
            }
        }
    }

    private renderLeaderboard(data: any[]) {
        if (data.length) {

            let lastEntryPoints = data[0].points;
            let lastEntryRank = 1;
            data[0].rank = lastEntryRank;

            for (let i = 1; i < data.length; i ++) {
                if (data[i].points === lastEntryPoints) {
                    data[i].rank = lastEntryRank;
                } else {
                    lastEntryPoints = data[i].points;
                    data[i].rank = ++ lastEntryRank;
                }
            }

            for (let i = data.length; i > 0;  i --) {
                const numberElt = this.createLeaderboardElt("" + data[i - 1].rank, data[i - 1].id);
                const usernameElt = this.createLeaderboardElt(data[i - 1].username, data[i - 1].id);
                const dataElt = this.createLeaderboardElt(data[i - 1].points, data[i - 1].id);

                this.containerElt.insertBefore(dataElt, this.containerElt.firstChild);
                this.containerElt.insertBefore(usernameElt, this.containerElt.firstChild);
                this.containerElt.insertBefore(numberElt, this.containerElt.firstChild);
            }
        }

    }

    private createLeaderboardElt(text: string, rankId: number) {
        const element = document.createElement("div");
        element.textContent = text;
        element.classList.add("leaderboard-entry", "leaderboard-entry-" + rankId);
        return element;
    }

    private retrieveLeaderboard(leaderboard: number): Promise<any[]> {
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
            }).then((stats: any[]) => {
                resolve(stats);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    private retrieveLeaderboardRank(leaderboard: number, token: string): Promise<any> {
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
                return response.json();
            }).then((data: any) => {
                resolve(data);
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
