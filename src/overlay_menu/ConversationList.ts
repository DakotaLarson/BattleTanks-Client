import Component from "../component/Component";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import Globals from "../Globals";

export default class ConversationList extends Component {

    private static readonly OPEN_COOLDOWN = 1500;
    private static readonly MAX_CONV_RECV = 5;

    private conversationIcon: HTMLElement;
    private notificationIcon: HTMLElement;

    private parentElt: HTMLElement;
    private containerElt: HTMLElement;
    private messageElt: HTMLElement;
    private loadMoreElt: HTMLElement;

    private conversationOffset: number;
    private conversationUsernames: Map<number, string>;

    private notificationQuantity: number;

    private listOpen: boolean;
    private openId: number;
    private lastFetchTime: number;

    constructor(menuElt: HTMLElement) {
        super();
        this.conversationIcon = DomHandler.getElement(".conversation-icon", menuElt);
        this.notificationIcon = DomHandler.getElement(".conversation-notification-icon", this.conversationIcon);

        this.parentElt = DomHandler.getElement(".conversation-list");
        this.containerElt = DomHandler.getElement(".conversation-container", this.parentElt);
        this.messageElt = DomHandler.getElement(".conversation-list-message", this.parentElt);
        this.loadMoreElt = DomHandler.getElement(".conversation-list-more", this.parentElt);

        this.conversationOffset = 0;
        this.conversationUsernames = new Map();

        this.notificationQuantity = 0;

        this.listOpen = false;
        this.openId = 0;
        this.lastFetchTime = performance.now();
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onClick);
        EventHandler.addListener(this, EventHandler.Event.NOTIFICATION_OFFLINE, this.onOfflineNotification);
    }

    private onClick(event: MouseEvent) {
        if (this.listOpen) {
            if (event.target !== this.parentElt && !this.parentElt.contains(event.target as Node)) {
                this.hideList();
            } else if ((event.target as HTMLElement).id.startsWith("conv")) {
                const convId = parseInt((event.target as HTMLElement).id.substr(4), 10);
                const username = this.conversationUsernames.get(convId);
                if (username) {
                    EventHandler.callEvent(EventHandler.Event.CONVERSATION_OPEN, username);
                }
                this.hideList();
            } else if (event.target === this.loadMoreElt) {
                this.showMoreMessages();
            }
        } else if (event.target === this.conversationIcon) {
            const now = performance.now();
            if (now > this.lastFetchTime + ConversationList.OPEN_COOLDOWN) {
                this.lastFetchTime = now;
                this.showList();
            }
        }
    }

    private onOfflineNotification(event: any) {
        this.updateNotificationIcon(++ this.notificationQuantity);
    }

    private showList() {
        if (Globals.getGlobal(Globals.Global.AUTH_TOKEN)) {
            this.messageElt.textContent = "Loading...";
            this.openId ++;
            this.showMoreMessages();

        } else {
            this.messageElt.textContent = "Sign in to send messages";
        }

        this.notificationQuantity = 0;
        this.updateNotificationIcon(this.notificationQuantity);

        this.parentElt.style.display = "inline-block";
        this.listOpen = true;
    }

    private hideList() {
        while (this.containerElt.firstChild) {
            this.containerElt.removeChild(this.containerElt.firstChild);
        }
        this.parentElt.style.display = "";
        this.messageElt.textContent = "";
        this.loadMoreElt.style.display = "";
        this.listOpen = false;
        this.conversationOffset = 0;
        this.conversationUsernames.clear();
    }

    private showMoreMessages() {
        this.fetchConversations(this.conversationOffset).then((conversations) => {
            if (conversations) {
                if (!conversations.length && !this.conversationOffset) {
                    this.messageElt.textContent = "No messages";
                } else {
                    let convId = 1;
                    this.conversationOffset += conversations.length;
                    for (const conversation of conversations) {
                        const elt = this.createConversationElt(conversation.username, conversation.body, convId ++);
                        this.containerElt.appendChild(elt);
                    }
                    this.messageElt.textContent = "";

                    if (conversations.length === ConversationList.MAX_CONV_RECV) {
                        this.loadMoreElt.style.display = "block";
                    } else {
                        this.loadMoreElt.style.display = "";
                    }
                }
            }
        }).catch((err) => {
            console.error(err);
            this.messageElt.textContent = "Error";
        });
    }

    private updateNotificationIcon(quantity: number) {
        if (quantity > 0) {
            this.notificationIcon.textContent = "" + quantity;
            this.notificationIcon.style.display = "block";
        } else {
            this.notificationIcon.textContent = "";
            this.notificationIcon.style.display = "";
        }
    }

    private createConversationElt(username: string, body: string, convId: number) {
        const parentElt = document.createElement("div");
        parentElt.classList.add("conversation-list-child");
        parentElt.setAttribute("id", "conv" + convId);

        const usernameElt = document.createElement("div");
        usernameElt.classList.add("conversation-list-child-username");
        usernameElt.textContent = username;

        const bodyElt = document.createElement("div");
        bodyElt.classList.add("conversation-list-child-body");
        bodyElt.textContent = body;

        parentElt.appendChild(usernameElt);
        parentElt.appendChild(bodyElt);

        this.conversationUsernames.set(convId, username);
        return parentElt;
    }

    private fetchConversations(offset: number) {
        const address = "http" + Globals.getGlobal(Globals.Global.HOST);
        const token = Globals.getGlobal(Globals.Global.AUTH_TOKEN);
        const body = JSON.stringify({
            token,
            offset,
        });
        const openId = this.openId;
        return fetch(address + "/conversations", {
            method: "post",
            mode: "cors",
            credentials: "omit",
            body,
            headers: {
                "content-type": "application/json",
            },
        }).then((response: Response) => {
            if (openId === this.openId && this.listOpen) {
                return response.json();
            } else {
                return undefined;
            }
        });
    }
}
