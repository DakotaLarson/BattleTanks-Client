import Component from "./component/Component";
import DomHandler from "./DomHandler";
import EventHandler from "./EventHandler";
import Globals from "./Globals";

export default class ProfileViewer extends Component {

    private static readonly SELECTION_COOLDOWN = 1500;

    private profileParentElt: HTMLElement;
    private profileHeaderElt: HTMLElement;
    private profileContainerElt: HTMLElement;
    private profileMessageElt: HTMLElement;

    private friendActionElt: HTMLElement;
    private messageActionElt: HTMLElement;

    private profileOpen: boolean;

    private lastSelectionTime: number;

    constructor() {
        super();
        this.profileParentElt = DomHandler.getElement(".profile-parent");
        this.profileHeaderElt = DomHandler.getElement(".profile-header", this.profileParentElt);
        this.profileContainerElt = DomHandler.getElement(".profile-container", this.profileParentElt);
        this.profileMessageElt = DomHandler.getElement(".profile-message", this.profileParentElt);

        this.friendActionElt = DomHandler.getElement(".profile-action-friend", this.profileParentElt);
        this.messageActionElt = DomHandler.getElement(".profile-action-message", this.profileParentElt);

        this.profileOpen = false;

        this.lastSelectionTime = performance.now();
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_GUI_MOUSEDOWN, this.onClick);
    }

    private onClick(event: MouseEvent) {
        if (this.profileOpen) {
            if (event.target !== this.profileParentElt && !this.profileParentElt.contains(event.target as Node)) {
                this.closeProfile();
            }
        } else if ((event.target as HTMLElement).classList.contains("profile-link")) {
            const currentTime = performance.now();
            if (currentTime > this.lastSelectionTime + ProfileViewer.SELECTION_COOLDOWN) {
                this.lastSelectionTime = currentTime;
                DomHandler.setInterference(true);
                this.openProfile((event.target as HTMLElement).textContent as string);
            }
        }
    }

    private openProfile(username: string | undefined) {
        if (username) {

            this.updateProfileHeader(username);

            this.getProfileData(username).then((data: any) => {
                this.renderProfileData(data);
                this.displayActions();
            }).catch((err) => {
                console.error(err);
                this.profileMessageElt.textContent = "Error";
            });
            this.showProfileParent();
            this.profileOpen = true;
        }
    }

    private closeProfile() {
        while (this.profileContainerElt.firstChild) {
            this.profileContainerElt.removeChild(this.profileContainerElt.firstChild);
        }
        this.profileMessageElt.textContent = "";
        this.profileParentElt.style.left = "";
        this.profileParentElt.style.right = "";
        this.profileParentElt.style.top = "";
        this.profileParentElt.style.bottom = "";
        this.profileParentElt.style.display = "";
        this.profileOpen = false;
    }

    private renderProfileData(data: any) {
        while (this.profileContainerElt.firstChild) {
            this.profileContainerElt.removeChild(this.profileContainerElt.firstChild);
        }
        this.formatProfileData(data);
        const dataTitles = ["points", "rank", "victories", "defeats", "V/D", "kills", "deaths", "K/D", "shots", "hits", "accuracy"];
        for (const title of dataTitles) {
            if (title in data) {
                this.profileContainerElt.appendChild(this.createProfileDataElt(title));
                this.profileContainerElt.appendChild(this.createProfileDataElt(data[title]));

            }
        }
    }

    private formatProfileData(data: any) {
        if (data.victories !== undefined) {
            let vdRatio = data.victories;
            if (data.defeats) {
                vdRatio = Math.round(vdRatio / data.defeats * 100) / 100;
            }
            data["V/D"] = vdRatio;
        }
        if (data.kills !== undefined) {
            let kdRatio = data.kills;
            if (data.deaths) {
                kdRatio = Math.round(kdRatio / data.deaths * 100) / 100;
            }
            data["K/D"] = kdRatio;
        }
        if (data.hits !== undefined) {
            let accuracy = data.hits * 100;
            if (data.shots) {
                accuracy = Math.round(accuracy / data.shots);
            }
            data.accuracy = accuracy + "%";
        }
    }

    private createProfileDataElt(title: string) {
        const element = document.createElement("div");
        element.textContent = title;
        element.classList.add("profile-data");
        return element;
    }

    private updateProfileHeader(text: string) {
        this.profileHeaderElt.textContent = text;
    }

    private showProfileParent() {
        const dimensions = DomHandler.getDisplayDimensions();
        const coordinates = DomHandler.getMouseCoordinates();
        if (coordinates.x < dimensions.width / 2) {
            const left = coordinates.x;
            if (coordinates.y < dimensions.height / 2) {
                const top = coordinates.y;
                this.profileParentElt.style.top = top + "px";
            } else {
                const bottom = dimensions.height - coordinates.y;
                this.profileParentElt.style.bottom = bottom + "px";
            }
            this.profileParentElt.style.left = left + "px";
        } else {
            const right = dimensions.width - coordinates.x;
            if (coordinates.y < dimensions.height / 2) {
                const top = coordinates.y;
                this.profileParentElt.style.top = top + "px";
            } else {
                const bottom = dimensions.height - coordinates.y;
                this.profileParentElt.style.bottom = bottom + "px";
            }
            this.profileParentElt.style.right = right + "px";
        }
        this.profileParentElt.style.display = "inline-block";
    }

    private getProfileData(username: string) {
        const address = "http" + Globals.getGlobal(Globals.Global.HOST);
        const body = JSON.stringify({
            username,
        });
        return fetch(address + "/profile", {
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
            return stats;
        });
    }

    private displayActions() {
        // todo
    }
}
