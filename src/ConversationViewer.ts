import Component from "./component/Component";
import DomEventHandler from "./DomEventHandler";
import DomHandler from "./DomHandler";
import DOMMutationHandler from "./DOMMutationHandler";
import EventHandler from "./EventHandler";
import Globals from "./Globals";

export default class ConversationViewer extends Component {

    private parentElt: HTMLElement;
    private headerElt: HTMLElement;
    private closeElt: HTMLElement;
    private messageContainerElt: HTMLElement;
    private newMessageElt: HTMLInputElement;
    private sendElt: HTMLElement;

    private offset: number;
    private conversationPlayer: string | undefined;

    private sendingMessage: boolean;
    private retrievingMesssages: boolean;
    private retrievedAllMessages: boolean;

    constructor() {
        super();
        this.parentElt = DomHandler.getElement(".conversation-parent");
        this.headerElt = DomHandler.getElement(".conversation-header", this.parentElt);
        this.closeElt = DomHandler.getElement(".conversation-close", this.parentElt);
        this.messageContainerElt = DomHandler.getElement(".conversation-message-container", this.parentElt);
        this.newMessageElt = DomHandler.getElement(".conversation-new-message", this.parentElt) as HTMLInputElement;
        this.sendElt = DomHandler.getElement(".converstaion-new-message-send", this.parentElt);

        this.offset = 0;

        this.sendingMessage = false;
        this.retrievingMesssages = false;
        this.retrievedAllMessages = false;
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.CONVERSATION_OPEN, this.showMessages);
        EventHandler.addListener(this, EventHandler.Event.NOTIFICATION_ONLINE, this.onNotification);
    }

    private showMessages(username: string) {
        this.conversationPlayer = username;
        this.headerElt.textContent = username;

        EventHandler.addListener(this, EventHandler.Event.DOM_GUI_MOUSEDOWN, this.onClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_KEYUP, this.onKeyUp);
        DomEventHandler.addListener(this, this.messageContainerElt, "wheel", this.onScroll);

        this.getMessages(this.offset);

        DOMMutationHandler.show(this.parentElt);

        setTimeout(() => {
            this.newMessageElt.focus();
        });
    }

    private onNotification(event: any) {
        if (this.conversationPlayer && event.type === "message" && event.body.username === this.conversationPlayer) {
            this.renderMessage(event.body.message, false);
        }
    }

    private hideMessages() {
        this.conversationPlayer = undefined;
        this.headerElt.textContent = "";

        EventHandler.removeListener(this, EventHandler.Event.DOM_GUI_MOUSEDOWN, this.onClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_KEYUP, this.onKeyUp);
        DomEventHandler.removeListener(this, this.messageContainerElt, "wheel", this.onScroll);

        this.clearMessages();
        DOMMutationHandler.setValue(this.newMessageElt);
        DOMMutationHandler.hide(this.parentElt);
        this.offset = 0;
        this.sendingMessage = false;
        this.retrievingMesssages = false;
        this.retrievedAllMessages = false;
        EventHandler.callEvent(EventHandler.Event.CONVERSATION_CLOSE);
    }

    private onClick(event: MouseEvent) {
        DomHandler.setInterference(true);
        if (event.target === this.closeElt || event.target === this.parentElt) {
            this.hideMessages();
        } else if (event.target === this.sendElt) {
            this.sendMessage();
        }
    }

    private onKeyUp(event: KeyboardEvent) {
        if (event.code === "Enter") {
            this.sendMessage();
        }
    }

    private onScroll() {
        if (!this.messageContainerElt.scrollTop) {
            this.getMessages(this.offset);
        }
    }

    private sendMessage() {
        const message = this.newMessageElt.value.trim();
        if (message && !this.sendingMessage) {
            this.sendMessageToServer(this.conversationPlayer as string, message).then((ok) => {
                if (ok) {
                    this.renderMessage(message, true);
                    this.offset ++;
                }
            }).catch((err) => {
                console.error(err);
            }).finally(() => {
                this.newMessageElt.value = "";
            });
        }
    }

    private renderMessages(messages: any[]) {
        const height = this.messageContainerElt.scrollHeight;
        for (const message of messages) {
            const messageElt = this.createMessageElt(message.body, message.sent);
            this.messageContainerElt.insertBefore(messageElt, this.messageContainerElt.firstChild);
        }
        this.messageContainerElt.scrollTop = this.messageContainerElt.scrollHeight -  height;
    }

    private renderMessage(message: string, sent: boolean) {
        const messageElt = this.createMessageElt(message, sent);
        this.messageContainerElt.appendChild(messageElt);
        this.messageContainerElt.scrollTop = this.messageContainerElt.scrollHeight;
    }

    private createMessageElt(message: string, sent: boolean) {
        const containerElt = document.createElement("div");
        containerElt.classList.add("conversation-message-content-container");
        if (sent) {
            containerElt.classList.add("conversation-message-content-container-sent");
        }
        const messageElt = document.createElement("span");
        messageElt.classList.add("conversation-message-content", "text-select");
        if (sent) {
            messageElt.classList.add("conversation-message-content-sent", "text-select");
        }
        messageElt.textContent = message;
        containerElt.appendChild(messageElt);

        return containerElt;
    }

    private getMessages(offset: number) {
        if (!this.retrievingMesssages && !this.retrievedAllMessages) {
            this.sendMessageToServer(this.conversationPlayer as string, undefined, offset).then((messages) => {
                if (messages.length) {
                    this.renderMessages(messages);
                    this.offset += messages.length;
                } else {
                    this.retrievedAllMessages = true;
                }
            }).catch((err) => {
                console.error(err);
            });
        }
    }

    private sendMessageToServer(username: string, message: string | undefined, offset?: number) {
        const address = "http" + Globals.getGlobal(Globals.Global.HOST);
        const token = Globals.getGlobal(Globals.Global.AUTH_TOKEN);
        const body: any = {
            token,
            username,
        };
        if (message) {
            body.message = message;
            this.sendingMessage = true;
        }
        if (offset) {
            body.offset = offset;
            this.retrievingMesssages = true;
        }
        return fetch(address + "/messages", {
            method: "post",
            mode: "cors",
            credentials: "omit",
            body: JSON.stringify(body),
            headers: {
                "content-type": "application/json",
            },
        }).then((response: Response) => {
            if (message) {
                this.sendingMessage = false;
                return response.ok;
            } else {
                this.retrievingMesssages = false;
                return response.json();
            }
        });
    }

    private clearMessages() {
        DOMMutationHandler.clear(this.messageContainerElt);
    }
}
