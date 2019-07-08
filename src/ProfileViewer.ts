import Component from "./component/Component";
import DomHandler from "./DomHandler";
import DOMMutationHandler from "./DOMMutationHandler";
import EventHandler from "./EventHandler";
import Globals from "./Globals";
import Confirmation from "./gui/Confirmation";
import RankCalculator from "./RankCalculator";

export default class ProfileViewer extends Component {

    private static readonly SELECTION_COOLDOWN = 1500;

    private static readonly VIEW_ACTION_PRIMARY = "View Stats";
    private static readonly VIEW_ACTION_STATS = "Hide Stats";

    private static readonly FRIEND_ACTION_TEXTCONTENT = [
        "Unblock",
        "Add Friend",
        "Add Friend",
        "Request Sent",
        "Accept Request",
        "Friends!",
    ];
    private static readonly FRIEND_ACTION_CLASSLIST = [
        undefined,
        "profile-action-disabled",
        undefined,
        "profile-action-disabled",
        undefined,
        "profile-action-enabled",
    ];

    private static readonly CONVERSATION_ACTION_CLASSLIST = [
        "profile-action-disabled",
        undefined,
    ];

    private static readonly NEGATIVE_ACTION_TEXTCONTENT = [
        "",
        "Block",
        "Cancel Request",
        "Delete Request",
        "Unfriend",
    ];

    private parentElt: HTMLElement;
    private headerElt: HTMLElement;

    private primaryContainerElt: HTMLElement;
    private statsContainerElt: HTMLElement;

    private messageElt: HTMLElement;

    private friendActionElt: HTMLElement;
    private conversationActionElt: HTMLElement;

    private viewActionElt: HTMLElement;
    private negativeActionElt: HTMLElement;

    private lastSelectionTime: number;

    private selectedUsername: string | undefined;

    private friendsState: number;
    private conversationsState: number;
    private negativeState: number;

    private updatingFriendship: boolean;
    private conversationOpen: boolean;
    private statsVisible: boolean;

    constructor() {
        super();

        this.parentElt = DomHandler.getElement(".profile-parent");
        this.headerElt = DomHandler.getElement(".profile-header", this.parentElt);
        this.primaryContainerElt = DomHandler.getElement(".profile-container-primary", this.parentElt);
        this.statsContainerElt = DomHandler.getElement(".profile-container-stats", this.parentElt);
        this.messageElt = DomHandler.getElement(".profile-message", this.parentElt);

        this.friendActionElt = DomHandler.getElement(".profile-action-friend", this.parentElt);
        this.conversationActionElt = DomHandler.getElement(".profile-action-conversation", this.parentElt);

        this.negativeActionElt = DomHandler.getElement(".profile-action-negative", this.parentElt);
        this.viewActionElt = DomHandler.getElement(".profile-action-view", this.parentElt);

        this.lastSelectionTime = performance.now();

        this.friendsState = 0;
        this.conversationsState = 0;
        this.negativeState = 0;

        this.updatingFriendship = false;
        this.conversationOpen = false;
        this.statsVisible = false;
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_GUI_MOUSEDOWN, this.onClick);
        EventHandler.addListener(this, EventHandler.Event.CONVERSATION_CLOSE, this.onConversationClose);
        EventHandler.addListener(this, EventHandler.Event.PROFILE_OPEN, this.openProfile);
        EventHandler.addListener(this, EventHandler.Event.NOTIFICATION_ONLINE, this.onNotification);
    }

    private async onClick(event: MouseEvent) {
        if (!this.conversationOpen) {
            const classList = (event.target as HTMLElement).classList;
            if (this.selectedUsername) {
                if (event.target !== this.parentElt && !this.parentElt.contains(event.target as Node)) {

                    // Click is outside.
                    this.closeProfile();

                } else if (event.target === this.conversationActionElt && !classList.contains("profile-action-disabled")) {

                    // Click is on conversation elt
                    EventHandler.callEvent(EventHandler.Event.CONVERSATION_OPEN, this.selectedUsername);
                    this.conversationOpen = true;

                } else if (event.target === this.friendActionElt && !classList.contains("profile-action-disabled") && !classList.contains("profile-action-enabled")) {

                    // Click is on friendship elt
                    this.updateFriendship(true);

                } else if (event.target === this.negativeActionElt) {

                    // Click is on negative action elt
                    let confirmation = true;

                    if (this.negativeState === 1 || this.negativeState === 4) {
                        confirmation = await Confirmation.confirm("Are you sure?");
                    }

                    if (confirmation) {
                        this.updateFriendship(false);
                    }
                } else if (event.target === this.viewActionElt) {
                    if (this.statsVisible) {
                        DOMMutationHandler.hide(this.primaryContainerElt);
                        DOMMutationHandler.show(this.statsContainerElt, "none");
                        DOMMutationHandler.setText(this.viewActionElt, ProfileViewer.VIEW_ACTION_PRIMARY);
                    } else {
                        DOMMutationHandler.hide(this.statsContainerElt);
                        DOMMutationHandler.show(this.primaryContainerElt, "none");
                        DOMMutationHandler.setText(this.viewActionElt, ProfileViewer.VIEW_ACTION_STATS);
                    }
                    this.statsVisible = !this.statsVisible;
                }
            } else if (classList.contains("profile-link")) {

                // Click is on profile link
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
                this.friendsState = 4;
                this.negativeState = 3;
                this.renderFriendship(this.friendsState, this.conversationsState, this.negativeState);
            } else if (event.type === "friend_accept") {
                this.friendsState = 5;
                this.conversationsState = 1;
                this.negativeState = 4;
                this.renderFriendship(this.friendsState, this.conversationsState, this.negativeState);
                this.conversationActionElt.setAttribute("title", "Send a message!");
                this.conversationActionElt.classList.remove("profile-action-disabled");
            }
        }
    }

    private openProfile(username: string | undefined) {
        if (username) {

            this.updateProfileHeader(username);

            DOMMutationHandler.clear(this.primaryContainerElt);
            DOMMutationHandler.clear(this.statsContainerElt);

            DOMMutationHandler.show(this.statsContainerElt, "none");
            DOMMutationHandler.hide(this.primaryContainerElt);
            DOMMutationHandler.hide(this.viewActionElt);

            this.getProfileData(username).then((data: any) => {
                this.renderProfileData(data);
            }).catch((err) => {
                console.error(err);
                this.messageElt.textContent = "Error";
            });
            this.showProfileParent();
            this.selectedUsername = username;
            EventHandler.callEvent(EventHandler.Event.PROFILE_OPENED);
        }
    }

    private closeProfile() {
        fastdom.mutate(() => {
            while (this.primaryContainerElt.firstChild) {
                this.primaryContainerElt.removeChild(this.primaryContainerElt.firstChild);
            }
            this.messageElt.textContent = "";

            this.friendActionElt.textContent = "";
            this.friendActionElt.classList.remove("profile-action-disabled");
            this.friendActionElt.removeAttribute("title");
            this.friendActionElt.style.display = "";

            this.conversationActionElt.classList.remove("profile-action-disabled");
            this.conversationActionElt.removeAttribute("title");
            this.conversationActionElt.style.display = "";

            this.negativeActionElt.style.display = "";

            this.parentElt.style.left = "";
            this.parentElt.style.right = "";
            this.parentElt.style.top = "";
            this.parentElt.style.bottom = "";
            this.parentElt.style.display = "";
        });

        this.selectedUsername = undefined;
        this.friendsState = -1;
    }

    private renderProfileData(data: any) {
        if (data.friendship) {
            this.friendsState = data.friendship.friends;
            this.negativeState = data.friendship.blocked;
            this.renderFriendship(data.friendship.friends, data.friendship.conversations, data.friendship.negative);

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
        const statTitles = ["points", "rank", "victories", "defeats", "V/D", "kills", "deaths", "K/D", "shots", "hits", "accuracy"];
        const primaryTitles = ["last seen", "first seen", "time played"];
        const primaryElts: HTMLElement[] = [];
        const statsElts: HTMLElement[] = [];

        for (const title of statTitles) {
            if (title in data) {
                statsElts.push(this.createProfileDataElt(title));
                statsElts.push(this.createProfileDataElt(data[title]));
            }
        }

        const rankData = RankCalculator.getData(data.points);

        primaryElts.push(this.createProfileDataElt("Rank"));
        primaryElts.push(this.createProfileDataElt(rankData.rank));

        primaryElts.push(this.createProfileDataElt("Level"));
        primaryElts.push(this.createProfileDataElt(rankData.level));

        for (const title of primaryTitles) {
            if (title in data) {
                primaryElts.push(this.createProfileDataElt(title));
                primaryElts.push(this.createProfileDataElt(data[title]));
            }
        }
        fastdom.mutate(() => {

            for (const elt of primaryElts) {
                this.primaryContainerElt.appendChild(elt);
            }

            for (const elt of statsElts) {
                this.statsContainerElt.appendChild(elt);
            }
        });

        DOMMutationHandler.setText(this.viewActionElt, ProfileViewer.VIEW_ACTION_PRIMARY);
        DOMMutationHandler.show(this.viewActionElt);
        this.statsVisible = false;
    }

    private renderFriendship(friends: number, conversations: number, negative: number) {
        this.friendsState = friends;
        this.conversationsState = conversations;
        this.negativeState = negative;

        this.friendActionElt.classList.remove("profile-action-disabled", "profile-action-enabled");
        this.conversationActionElt.classList.remove("profile-action-disabled");

        this.friendActionElt.textContent = ProfileViewer.FRIEND_ACTION_TEXTCONTENT[friends];
        const friendsClass = ProfileViewer.FRIEND_ACTION_CLASSLIST[friends];
        if (friendsClass) {
            this.friendActionElt.classList.add(friendsClass);
        }

        const conversationsClass = ProfileViewer.CONVERSATION_ACTION_CLASSLIST[conversations];
        if (conversationsClass) {
            this.conversationActionElt.classList.add(conversationsClass);
        }

        const negativeTextContent = ProfileViewer.NEGATIVE_ACTION_TEXTCONTENT[negative];
        this.negativeActionElt.textContent = negativeTextContent;
        this.negativeActionElt.style.display = negativeTextContent ? "block" : "";
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
        if (data.last_seen) {
            if (data.online) {
                data["last seen"] = "Online!";
            } else {
                data["last seen"] = new Date(data.last_seen).toLocaleDateString();
            }
        }
        if (data.first_seen) {
            data["first seen"] = new Date(data.first_seen).toLocaleDateString();
        }
        if (data.play_time !== undefined) {
            const time = data.play_time;

            const hours = Math.floor(time / 3600);
            const minutes = Math.floor((time - hours * 3600) / 60);
            const seconds = time - hours * 3600 - minutes * 60;

            const hourStr = hours < 10 ? "0" + hours : "" + hours;
            const minuteStr = minutes < 10 ? "0" + minutes : "" + minutes;
            const secondsStr = seconds < 10 ? "0" + seconds : "" + seconds;

            data["time played"] = hourStr + ":" + minuteStr + ":" + secondsStr;
        }
    }

    private createProfileDataElt(title: string) {
        const element = document.createElement("div");
        element.textContent = title;
        element.classList.add("profile-data");
        return element;
    }

    private updateProfileHeader(text: string) {
        this.headerElt.textContent = text;
    }

    private showProfileParent() {
        fastdom.mutate(() => {
            const dimensions = DomHandler.getDisplayDimensions();
            const coordinates = DomHandler.getMouseCoordinates();
            if (coordinates.x < dimensions.width / 2) {
                const left = coordinates.x;
                if (coordinates.y < dimensions.height / 2) {
                    const top = coordinates.y;
                    this.parentElt.style.top = top + "px";
                } else {
                    const bottom = dimensions.height - coordinates.y;
                    this.parentElt.style.bottom = bottom + "px";
                }
                this.parentElt.style.left = left + "px";
            } else {
                const right = dimensions.width - coordinates.x;
                if (coordinates.y < dimensions.height / 2) {
                    const top = coordinates.y;
                    this.parentElt.style.top = top + "px";
                } else {
                    const bottom = dimensions.height - coordinates.y;
                    this.parentElt.style.bottom = bottom + "px";
                }
                this.parentElt.style.right = right + "px";
            }
            this.parentElt.style.display = "inline-block";
        });
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
                    return response.json();
                }).then((update) => {
                    this.updatingFriendship = false;
                    this.friendsState = update.friends;
                    this.conversationsState = update.conversations;
                    this.negativeState = update.negative;
                    this.renderFriendship(this.friendsState, this.conversationsState, this.negativeState);
                    resolve();
                }).catch(reject);
            } else {
                reject();
            }
        });
    }
}
