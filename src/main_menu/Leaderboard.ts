import ChildComponent from "../component/ChildComponent";
import DomEventHandler from "../DomEventHandler";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import Globals from "../Globals";

export default class Leaderboard extends ChildComponent {

    private static readonly SELECTION_COOLDOWN = 1000;

    private static readonly SEARCH_TYPING_TIME = 500;

    private messageElt: HTMLElement;
    private leaderboardContainerElt: HTMLElement;
    private searchContainerElt: HTMLElement;

    private selection1Elt: HTMLElement;
    private selection2Elt: HTMLElement;
    private selection3Elt: HTMLElement;
    private searchElt: HTMLElement;

    private titleElt: HTMLElement;
    private searchInputElt: HTMLInputElement;

    private searchToggleParentElt: HTMLElement;
    private searchToggleEveryoneElt: HTMLElement;
    private searchToggleFriendsElt: HTMLElement;

    private selectedElt: HTMLElement;
    private leaderboardSelection: number;
    private lastSelectionTime: number;

    private leaderboardVisible: boolean;
    private searchingFriends: boolean;
    private typingTimeout: number | undefined;

    constructor(menuElt: HTMLElement) {
        super();

        this.messageElt = DomHandler.getElement(".leaderboard-message", menuElt);
        this.leaderboardContainerElt = DomHandler.getElement(".leaderboard-container", menuElt);
        this.searchContainerElt = DomHandler.getElement(".search-container", menuElt);

        this.selection1Elt = DomHandler.getElement("#leaderboard-selection-1", menuElt);
        this.selection2Elt = DomHandler.getElement("#leaderboard-selection-2", menuElt);
        this.selection3Elt = DomHandler.getElement("#leaderboard-selection-3", menuElt);
        this.searchElt = DomHandler.getElement(".leaderboard-search", menuElt);

        this.titleElt = DomHandler.getElement(".leaderboard-title", menuElt);
        this.searchInputElt = DomHandler.getElement(".leaderboard-search-input", menuElt) as HTMLInputElement;

        this.searchToggleParentElt = DomHandler.getElement(".leaderboard-search-toggle-parent", menuElt);
        this.searchToggleEveryoneElt = DomHandler.getElement(".leaderboard-search-toggle-everyone", this.searchToggleParentElt);
        this.searchToggleFriendsElt = DomHandler.getElement(".leaderboard-search-toggle-friends", this.searchToggleParentElt);

        let leaderboardSelection = parseInt(localStorage.getItem("leaderboardSelection") as string, 10);
        if (isNaN(leaderboardSelection)) {
            leaderboardSelection = 3;
            localStorage.setItem("leaderboardSelection", "" + leaderboardSelection);
        }
        this.leaderboardSelection = leaderboardSelection;

        this.selectedElt = this.getSelectionElt(leaderboardSelection);
        this.selectedElt.classList.add("leaderboard-selection-selected");
        this.lastSelectionTime = performance.now();

        this.leaderboardVisible = true;
        this.searchingFriends = false;
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
    }

    private onSignIn() {
        this.updateLeaderboards();
        if (!this.leaderboardVisible) {
            this.showSearchToggle();
        }
    }

    private onSignOut() {
        this.updateLeaderboards();
        if (!this.leaderboardVisible) {
            this.hideSearchToggle();
        }
    }

    private onClick(event: MouseEvent) {
        if (performance.now() - this.lastSelectionTime > Leaderboard.SELECTION_COOLDOWN && event.target !== this.selectedElt) {
            if (event.target === this.selection1Elt) {
                this.updateLeaderboardSelection(1);
                this.updateLeaderboards();
                this.updateSelectedElement(this.selection1Elt);
                this.updateLeaderboardVisibility(true);
            } else if (event.target === this.selection2Elt) {
                this.updateLeaderboardSelection(2);
                this.updateLeaderboards();
                this.updateSelectedElement(this.selection2Elt);
                this.updateLeaderboardVisibility(true);
            } else if (event.target === this.selection3Elt) {
                this.updateLeaderboardSelection(3);
                this.updateLeaderboards();
                this.updateSelectedElement(this.selection3Elt);
                this.updateLeaderboardVisibility(true);
            } else if (event.target === this.searchElt) {
                this.updateSelectedElement(this.searchElt);
                this.updateLeaderboardVisibility(false);
            } else if (event.target === this.searchToggleEveryoneElt) {
                this.onSearchToggleUpdate(false);
            } else if (event.target === this.searchToggleFriendsElt) {
                this.onSearchToggleUpdate(true);
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
        while (this.leaderboardContainerElt.firstChild) {
            this.leaderboardContainerElt.removeChild(this.leaderboardContainerElt.firstChild);
        }
        this.messageElt.textContent = "";
    }

    private clearSearchResults() {
        while (this.searchContainerElt.firstChild) {
            this.searchContainerElt.removeChild(this.searchContainerElt.firstChild);
        }
    }

    private getLeaderboard() {
        return new Promise((resolve) => {
            this.clearLeaderboard();
            this.messageElt.textContent = "Loading...";
            this.retrieveLeaderboard(this.leaderboardSelection).then((data: any) => {
                this.updateLeaderboardSelectionTitle(this.leaderboardSelection, data.lastReset);
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
        this.retrieveLeaderboardRank(this.leaderboardSelection, token).then((rankData) => {

            let rankElts = this.leaderboardContainerElt.querySelectorAll(".leaderboard-entry-" + rankData.id);

            if (!rankElts.length) {
                if (!this.leaderboardContainerElt.firstChild) {
                    // There is no leaderboard data to compare to.
                    return;
                }
                const numberElt = this.createLeaderboardElt(rankData.rank, rankData.id, false);
                const usernameElt = this.createLeaderboardElt(rankData.username, rankData.id, true);
                const dataElt = this.createLeaderboardElt(rankData.points, rankData.id, false);

                this.leaderboardContainerElt.appendChild(numberElt);
                this.leaderboardContainerElt.appendChild(usernameElt);
                this.leaderboardContainerElt.appendChild(dataElt);

                rankElts = this.leaderboardContainerElt.querySelectorAll(".leaderboard-entry-" + rankData.id);
            }

            for (const rankElt of Array.from(rankElts)) {
                (rankElt as HTMLElement).style.color = "#03c95f";
            }

        }).catch((err) => {
            console.error(err);
        });
    }

    private updateLeaderboardSelectionTitle(column: number, lastReset: number) {
        if (column === 1) {
            if (lastReset) {
                this.selection1Elt.textContent = (lastReset + 1) + " Weeks";
            } else {
                this.selection1Elt.textContent = "Week";
            }
        } else if (column === 2) {
            if (lastReset) {
                this.selection2Elt.textContent = (lastReset + 1) + " Months";
            } else {
                this.selection2Elt.textContent = "Month";
            }
        }
    }

    private updateLeaderboardVisibility(showLeaderboard: boolean) {
        if (showLeaderboard !== this.leaderboardVisible) {
            if (showLeaderboard) {
                this.titleElt.style.display = "";
                this.leaderboardContainerElt.style.display = "";

            } else {
                this.titleElt.style.display = "none";
                this.leaderboardContainerElt.style.display = "none";
            }
            this.updateSearchVisibility(!showLeaderboard);
            this.leaderboardVisible = showLeaderboard;
        }
    }

    private updateSearchVisibility(show: boolean) {
        if (show) {

            this.searchInputElt.style.display = "inline-block";
            this.searchContainerElt.style.display = "grid";
            this.searchInputElt.style.display = "inline-block";

            if (Globals.getGlobal(Globals.Global.AUTH_TOKEN)) {
                this.showSearchToggle();
            }

            DomEventHandler.addListener(this, this.searchInputElt, "input", this.onSearchInput);
            this.searchInputElt.focus();

        } else {
            this.searchInputElt.style.display = "";
            this.searchContainerElt.style.display = "";
            this.searchInputElt.style.display = "";

            this.hideSearchToggle();

            this.clearSearchResults();
            this.searchInputElt.value = "";

            DomEventHandler.removeListener(this, this.searchInputElt, "input", this.onSearchInput);
            window.clearTimeout(this.typingTimeout);
        }
    }

    private showSearchToggle() {
        this.searchToggleParentElt.style.display = "flex";

        if (this.searchingFriends) {
            this.searchToggleFriendsElt.classList.add("leaderboard-selection-selected");
        } else {
            this.searchToggleEveryoneElt.classList.add("leaderboard-selection-selected");
        }
    }

    private hideSearchToggle() {
        this.searchToggleParentElt.style.display = "";
        this.searchToggleFriendsElt.classList.remove("leaderboard-selection-selected");
        this.searchToggleEveryoneElt.classList.remove("leaderboard-selection-selected");
    }

    private onSearchInput() {
        if (this.typingTimeout) {
            window.clearTimeout(this.typingTimeout);
        }
        this.typingTimeout = window.setTimeout(() => {
            this.onTypingEnd();
            this.typingTimeout = undefined;
        }, Leaderboard.SEARCH_TYPING_TIME);
    }

    private onSearchToggleUpdate(searchingFriends: boolean) {
        if (this.searchingFriends !== searchingFriends) {
            this.lastSelectionTime = performance.now();
            if (searchingFriends) {
                this.searchToggleFriendsElt.classList.add("leaderboard-selection-selected");
                this.searchToggleEveryoneElt.classList.remove("leaderboard-selection-selected");
            } else {
                this.searchToggleFriendsElt.classList.remove("leaderboard-selection-selected");
                this.searchToggleEveryoneElt.classList.add("leaderboard-selection-selected");
            }
            this.searchInputElt.focus();
            this.searchingFriends = !this.searchingFriends;
            this.onTypingEnd();
        }
    }

    private onTypingEnd() {
        let name = this.searchInputElt.value;
        name = name.trim();
        if (name) {
            this.retrieveSearchResults(name).then((results) => {
                this.clearSearchResults();
                this.renderSearchResults(results);
            }).catch((err) => {
                console.log(err);
            });
        } else {
            this.clearSearchResults();
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
                const numberElt = this.createLeaderboardElt("" + data[i - 1].rank, data[i - 1].id, false);
                const usernameElt = this.createLeaderboardElt(data[i - 1].username, data[i - 1].id, true);
                const dataElt = this.createLeaderboardElt(data[i - 1].points, data[i - 1].id, false);

                this.leaderboardContainerElt.insertBefore(dataElt, this.leaderboardContainerElt.firstChild);
                this.leaderboardContainerElt.insertBefore(usernameElt, this.leaderboardContainerElt.firstChild);
                this.leaderboardContainerElt.insertBefore(numberElt, this.leaderboardContainerElt.firstChild);
            }
        }
    }

    private renderSearchResults(results: any[]) {
        for (const result of results) {
            const usernameElt = this.createSearchResultElt(result.username, true);
            const pointsElt = this.createSearchResultElt(result.points, false);

            if (result.isPlayer) {
                usernameElt.style.color = "#03c95f";
                pointsElt.style.color = "#03c95f";
            }

            this.searchContainerElt.appendChild(usernameElt);
            this.searchContainerElt.appendChild(pointsElt);
        }
    }

    private createLeaderboardElt(text: string, rankId: number, isUsername: boolean) {
        const element = document.createElement("div");
        element.textContent = text;
        element.classList.add("leaderboard-entry", "leaderboard-entry-" + rankId);
        if (isUsername) {
            element.classList.add("profile-link", "leaderboard-entry-username");
        }
        return element;
    }

    private createSearchResultElt(text: string, isUsername: boolean) {
        const element = document.createElement("div");
        element.textContent = text;
        if (isUsername) {
            element.classList.add("search-result", "profile-link");
        } else {
            element.classList.add("search-result");
        }
        return element;
    }

    private retrieveLeaderboard(leaderboard: number): Promise<any[]> {
            const address = "http" + Globals.getGlobal(Globals.Global.HOST);
            const body = JSON.stringify({
                leaderboard,
            });

            return fetch(address + "/leaderboard", {
                method: "post",
                mode: "cors",
                credentials: "omit",
                body,
                headers: {
                    "content-type": "application/json",
                },
            }).then((response: Response) => {
                return response.json();
            });
    }

    private retrieveLeaderboardRank(leaderboard: number, token: string): Promise<any> {
        const address = "http" + Globals.getGlobal(Globals.Global.HOST);
        const body = JSON.stringify({
            leaderboard,
            token,
        });
        return fetch(address + "/leaderboardrank", {
            method: "post",
            mode: "cors",
            credentials: "omit",
            body,
            headers: {
                "content-type": "application/json",
            },
        }).then((response: Response) => {
            return response.json();
        });
    }

    private retrieveSearchResults(query: string): Promise<any[]> {
        const address = "http" + Globals.getGlobal(Globals.Global.HOST);
        const payload: any = {
            query,
        };
        const authToken = Globals.getGlobal(Globals.Global.AUTH_TOKEN);
        if (authToken) {
            payload.token = authToken;
            payload.friends = this.searchingFriends;
        }
        return fetch(address + "/search", {
            method: "post",
            mode: "cors",
            credentials: "omit",
            body: JSON.stringify(payload),
            headers: {
                "content-type": "application/json",
            },
        }).then((response: Response) => {
            return response.json();
        });
    }

    private updateSelectedElement(element: HTMLElement) {
        this.selectedElt.classList.remove("leaderboard-selection-selected");
        this.selectedElt = element;
        element.classList.add("leaderboard-selection-selected");
    }

    private getSelectionElt(leaderboard: number) {
        if (leaderboard === 1) {
            return this.selection1Elt;
        } else if (leaderboard === 2) {
            return this.selection2Elt;
        } else if (leaderboard === 3) {
            return this.selection3Elt;
        } else {
            throw new Error("Unknown leaderboard: " + leaderboard);
        }
    }

    private updateLeaderboardSelection(leaderboard: number) {
        this.leaderboardSelection = leaderboard;
        localStorage.setItem("leaderboardSelection", "" + leaderboard);
    }
}
