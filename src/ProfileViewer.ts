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

    private profileOpen: boolean;

    private lastSelectionTime: number;

    constructor() {
        super();
        this.profileParentElt = DomHandler.getElement(".profile-parent");
        this.profileHeaderElt = DomHandler.getElement(".profile-header", this.profileParentElt);
        this.profileContainerElt = DomHandler.getElement(".profile-container", this.profileParentElt);
        this.profileMessageElt = DomHandler.getElement(".profile-message", this.profileParentElt);

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
        this.profileParentElt.style.display = "";
        this.profileOpen = false;
    }

    private renderProfileData(data: any) {
        while (this.profileContainerElt.firstChild) {
            this.profileContainerElt.removeChild(this.profileContainerElt.firstChild);
        }
        this.formatStats(data);
        const statTitles = ["points", "rank", "victories", "defeats", "V/D", "kills", "deaths", "K/D", "shots", "hits", "accuracy"];
        for (const stat of statTitles) {
            if (stat in data) {
                this.profileContainerElt.appendChild(this.createStatElt(stat));
                this.profileContainerElt.appendChild(this.createStatElt(data[stat]));

            }
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
}
