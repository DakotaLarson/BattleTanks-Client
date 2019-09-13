import ChildComponent from "../../component/ChildComponent";
import DomEventHandler from "../../DomEventHandler";
import DomHandler from "../../DomHandler";
import DOMMutationHandler from "../../DOMMutationHandler";
import EventHandler from "../../EventHandler";
import Globals from "../../Globals";

export default class PlayerFinder extends ChildComponent {

    private static readonly SEARCH_TYPING_TIME = 500;

    private parentElt: HTMLElement;

    private searchToggleParentElt: HTMLElement;
    private searchToggleFriendsElt: HTMLElement;
    private searchToggleEveryoneElt: HTMLElement;

    private searchInputElt: HTMLInputElement;
    private searchContainerElt: HTMLElement;

    private searchingFriends: boolean;
    private typingTimeout: number | undefined;

    constructor(menuElt: HTMLElement) {
        super();

        this.parentElt = DomHandler.getElement(".side-panel-find", menuElt);
        this.searchToggleParentElt = DomHandler.getElement(".side-panel-search-toggle-parent", this.parentElt);
        this.searchToggleEveryoneElt = DomHandler.getElement(".side-panel-search-toggle-everyone", this.searchToggleParentElt);
        this.searchToggleFriendsElt = DomHandler.getElement(".side-panel-search-toggle-friends", this.searchToggleParentElt);

        this.searchInputElt = DomHandler.getElement(".side-panel-search-input", menuElt) as HTMLInputElement;
        this.searchContainerElt = DomHandler.getElement(".side-panel-search-container", this.parentElt);

        this.searchingFriends = false;
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK_PRIMARY, this.onClick);

        DomEventHandler.addListener(this, this.searchInputElt, "input", this.onSearchInput);

        DOMMutationHandler.show(this.parentElt);

        if (Globals.getGlobal(Globals.Global.AUTH_TOKEN)) {
            this.showSearchToggle();
        } else {
            this.hideSearchToggle();
        }
        DOMMutationHandler.focus(this.searchInputElt);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK_PRIMARY, this.onClick);

        DomEventHandler.removeListener(this, this.searchInputElt, "input", this.onSearchInput);

        DOMMutationHandler.setValue(this.searchInputElt);
        DOMMutationHandler.clear(this.searchContainerElt);

        DOMMutationHandler.hide(this.parentElt);

    }

    private onClick(event: MouseEvent) {
        if (event.target === this.searchToggleEveryoneElt) {
                this.onSearchToggleUpdate(false);
        } else if (event.target === this.searchToggleFriendsElt) {
            this.onSearchToggleUpdate(true);
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
        }, PlayerFinder.SEARCH_TYPING_TIME);
    }

    private onSearchToggleUpdate(searchingFriends: boolean) {
        if (this.searchingFriends !== searchingFriends) {
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

    private async onTypingEnd() {
        let name = this.searchInputElt.value;
        name = name.trim();
        if (name) {
            try {
                const results = await this.retrieveSearchResults(name);
                DOMMutationHandler.clear(this.searchContainerElt);
                this.renderSearchResults(results);
            } catch (err) {
                console.log(err);
            }
        } else {
            DOMMutationHandler.clear(this.searchContainerElt);
        }
    }

    private renderSearchResults(results: any[]) {
        const elements: HTMLElement[] = [];
        for (const result of results) {
            const usernameElt = this.createSearchResultElt(result.username, true);
            const pointsElt = this.createSearchResultElt(result.points, false);

            if (result.isPlayer) {
                usernameElt.style.color = "#03c95f";
                pointsElt.style.color = "#03c95f";
            }

            elements.push(usernameElt);
            elements.push(pointsElt);
        }
        if (elements.length) {
            for (const elt of elements) {
                this.searchContainerElt.appendChild(elt);
            }
        }
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

    private async retrieveSearchResults(query: string): Promise<any[]> {
        const address = "http" + Globals.getGlobal(Globals.Global.HOST);
        const payload: any = {
            query,
        };
        const authToken = Globals.getGlobal(Globals.Global.AUTH_TOKEN);
        if (authToken) {
            payload.token = authToken;
            payload.friends = this.searchingFriends;
        }
        const response = await fetch(address + "/search", {
            method: "post",
            mode: "cors",
            credentials: "omit",
            body: JSON.stringify(payload),
            headers: {
                "content-type": "application/json",
            },
        });
        return response.json();
    }
}
