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
    private conversationActionElt: HTMLElement;
    private negativeActionElt: HTMLElement;

    private lastSelectionTime: number;

    private selectedUsername: string | undefined;
    private friendState: number;
    private updatingFriendship: boolean;
    private conversationOpen: boolean;

    constructor() {
        super();

        this.profileParentElt = DomHandler.getElement(".profile-parent");
        this.profileHeaderElt = DomHandler.getElement(".profile-header", this.profileParentElt);
        this.profileContainerElt = DomHandler.getElement(".profile-container", this.profileParentElt);
        this.profileMessageElt = DomHandler.getElement(".profile-message", this.profileParentElt);

        this.friendActionElt = DomHandler.getElement(".profile-action-friend", this.profileParentElt);
        this.conversationActionElt = DomHandler.getElement(".profile-action-conversation", this.profileParentElt);
        this.negativeActionElt = DomHandler.getElement(".profile-action-negative", this.profileParentElt);

        this.lastSelectionTime = performance.now();

        this.friendState = -1;
        this.updatingFriendship = false;
        this.conversationOpen = false;
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_GUI_MOUSEDOWN, this.onClick);
        EventHandler.addListener(this, EventHandler.Event.CONVERSATION_CLOSE, this.onConversationClose);
        EventHandler.addListener(this, EventHandler.Event.PROFILE_OPEN, this.openProfile);
        EventHandler.addListener(this, EventHandler.Event.NOTIFICATION_ONLINE, this.onNotification);
    }

    private onClick(event: MouseEvent) {
        if (!this.conversationOpen) {
            const classList = (event.target as HTMLElement).classList;
            if (this.selectedUsername) {
                if (event.target !== this.profileParentElt && !this.profileParentElt.contains(event.target as Node)) {
                    this.closeProfile();
                } else if (event.target === this.conversationActionElt && !classList.contains("profile-action-disabled")) {
                    EventHandler.callEvent(EventHandler.Event.CONVERSATION_OPEN, this.selectedUsername);
                    this.conversationOpen = true;
                } else if (event.target === this.friendActionElt && !classList.contains("profile-action-disabled") && !classList.contains("profile-action-enabled")) {
                    this.updateFriendship(true);
                } else if (event.target === this.negativeActionElt) {
                    let confirmation = true;
                    if (this.friendState === 3) {
                        confirmation = window.confirm("Are you sure?");
                    }
                    if (confirmation) {
                        this.updateFriendship(false);
                    }
                }
            } else if (classList.contains("profile-link")) {
                const currentTime = performance.now();
                if (currentTime > this.lastSelectionTime + ProfileViewer.SELECTION_COOLDOWN) {
                    this.lastSelectionTime = currentTime;
                    DomHandler.setInterference(true);
                    this.openProfile((event.target as HTMLElement).textContent as string);
                }
            }
        }
    }

    private onConversationClose() {
        this.conversationOpen = false;
    }

    private onNotification(event: any) {
        if (this.selectedUsername && event.body.username === this.selectedUsername) {
            if (event.type === "friend_request") {
                this.friendState = 2;
                this.renderFriendship(this.friendState);
            } else if (event.type === "friend_accept") {
                this.friendState = 3;
                this.renderFriendship(this.friendState);
                this.conversationActionElt.setAttribute("title", "Send a message!");
                this.conversationActionElt.classList.remove("profile-action-disabled");
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
            this.selectedUsername = username;
            EventHandler.callEvent(EventHandler.Event.PROFILE_OPENED);
        }
    }

    private closeProfile() {
        while (this.profileContainerElt.firstChild) {
            this.profileContainerElt.removeChild(this.profileContainerElt.firstChild);
        }
        this.profileMessageElt.textContent = "";

        this.friendActionElt.textContent = "";
        this.friendActionElt.classList.remove("profile-action-disabled");
        this.friendActionElt.removeAttribute("title");
        this.friendActionElt.style.display = "";

        this.conversationActionElt.classList.remove("profile-action-disabled");
        this.conversationActionElt.removeAttribute("title");
        this.conversationActionElt.style.display = "";

        this.negativeActionElt.style.display = "";

        this.profileParentElt.style.left = "";
        this.profileParentElt.style.right = "";
        this.profileParentElt.style.top = "";
        this.profileParentElt.style.bottom = "";
        this.profileParentElt.style.display = "";

        this.selectedUsername = undefined;
        this.friendState = -1;
    }

    private renderProfileData(data: any) {
        while (this.profileContainerElt.firstChild) {
            this.profileContainerElt.removeChild(this.profileContainerElt.firstChild);
        }

        if (data.friendship) {
            this.friendState = data.friendship.friends;
            this.renderFriendship(this.friendState);

            if (!data.friendship.conversations) {
                this.conversationActionElt.classList.add("profile-action-disabled");
                this.conversationActionElt.setAttribute("title", "You must be friends to send messages.");
            } else {
                this.conversationActionElt.setAttribute("title", "Send a message!");
            }
            this.friendActionElt.style.display = "inline-block";
            this.conversationActionElt.style.display = "inline-block";
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

    private renderFriendship(state: number) {
        const friendActionData = [
            {
                text: "Add Friend",
                title: "You cannot request to be friends.",
                class: "profile-action-disabled",
            },
            {
                text: "Add Friend",
                title: "Send a request to be friends!",
            },
            {
                text: "Request Sent!",
                title: "Your request has been sent!",
                class: "profile-action-disabled",
            },
            {
                text: "Accept Request",
                title: "Accept request to be friends!",
            },
            {
                text: "Friends!",
                title: "You are friends!",
                class: "profile-action-enabled",
            },
        ];
        const negativeActionVisibleIndices = [1, 2, 3];
        const negativeActionText = [
            "Cancel Request",
            "Delete Request",
            "Unfriend",
        ];

        if (negativeActionVisibleIndices.includes(state)) {
            this.negativeActionElt.style.display = "block";
            this.negativeActionElt.textContent = negativeActionText[state - 1];
        } else {
            this.negativeActionElt.style.display = "";
            this.negativeActionElt.textContent = "";
        }

        const eltData = friendActionData[state + 1];
        this.friendActionElt.textContent = eltData.text;
        this.friendActionElt.setAttribute("title", eltData.title);
        this.friendActionElt.classList.remove("profile-action-disabled", "profile-action-enabled");
        if (eltData.class) {
            this.friendActionElt.classList.add(eltData.class);
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
        const token = Globals.getGlobal(Globals.Global.AUTH_TOKEN);
        const body: any = {
            username,
        };
        if (token) {
            body.token = token;
        }
        return fetch(address + "/profile", {
            method: "post",
            mode: "cors",
            credentials: "omit",
            body: JSON.stringify(body),
            headers: {
                "content-type": "application/json",
            },
        }).then((response: Response) => {
            return response.json();
        });
    }

    private updateFriendship(action: boolean) {
        return new Promise((resolve, reject) => {
            if (!this.updatingFriendship) {
                this.updatingFriendship = true;
                const address = "http" + Globals.getGlobal(Globals.Global.HOST);
                const token = Globals.getGlobal(Globals.Global.AUTH_TOKEN);
                const body = JSON.stringify({
                    token,
                    username: this.selectedUsername,
                    state: this.friendState,
                    action,
                });
                fetch(address + "/friend", {
                    method: "post",
                    mode: "cors",
                    credentials: "omit",
                    body,
                    headers: {
                        "content-type": "application/json",
                    },
                }).then((response: Response) => {
                    this.updatingFriendship = false;
                    if (response.ok) {
                        if (action) {
                            this.friendState ++;
                        } else {
                            this.friendState = 0;
                        }
                        this.renderFriendship(this.friendState);
                        resolve();
                    } else {
                        console.error("Unexpected response: " + response.status);
                        reject();
                    }
                }).catch(reject);
            } else {
                reject();
            }
        });
    }
}
