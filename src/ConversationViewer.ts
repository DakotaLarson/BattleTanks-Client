import ChildComponent from "./component/ChildComponent";
import DomHandler from "./DomHandler";
import EventHandler from "./EventHandler";
import Globals from "./Globals";

export default class ConversationViewer extends ChildComponent {

    private parentElt: HTMLElement;
    private headerElt: HTMLElement;
    private closeElt: HTMLElement;
    private messageContainerElt: HTMLElement;
    private newMessageElt: HTMLInputElement;
    private sendElt: HTMLElement;

    private offset: number;
    private conversationPlayer: string | undefined;

    constructor() {
        super();
        this.parentElt = DomHandler.getElement(".conversation-parent");
        this.headerElt = DomHandler.getElement(".conversation-header", this.parentElt);
        this.closeElt = DomHandler.getElement(".conversation-close", this.parentElt);
        this.messageContainerElt = DomHandler.getElement(".conversation-message-container", this.parentElt);
        this.newMessageElt = DomHandler.getElement(".conversation-new-message", this.parentElt) as HTMLInputElement;
        this.sendElt = DomHandler.getElement(".converstaion-new-message-send");

        this.offset = 0;
    }

    public enable() {

        EventHandler.addListener(this, EventHandler.Event.DOM_GUI_MOUSEDOWN, this.onClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_KEYUP, this.onKeyUp);

        this.getMessages(this.offset);

        this.parentElt.style.display = "block";

        setImmediate(() => {
            this.newMessageElt.focus();
        });
    }

    public disable() {

        EventHandler.removeListener(this, EventHandler.Event.DOM_GUI_MOUSEDOWN, this.onClick);

        this.clearMessages();
        this.newMessageElt.value = "";
        this.parentElt.style.display = "";
        this.offset = 0;
    }

    public updateConversationPlayer(username: string) {
        this.conversationPlayer = username;
        this.headerElt.textContent = username;
    }

    private onClick(event: MouseEvent) {
        DomHandler.setInterference(true);
        if (event.target === this.closeElt) {
            EventHandler.callEvent(EventHandler.Event.CONVERSATION_CLOSE);
        } else if (event.target === this.sendElt) {
            this.sendMessage();
        }
    }

    private onKeyUp(event: KeyboardEvent) {
        if (event.code === "Enter") {
            this.sendMessage();
        }
    }

    private sendMessage() {
        const message = this.newMessageElt.value.trim();
        if (message) {
            this.sendMessageToServer(this.conversationPlayer as string, message).then((ok) => {
                console.log(ok);
            }).catch((err) => {
                console.error(err);
            });
        }
    }

    private getMessages(offset: number) {
        this.sendMessageToServer(this.conversationPlayer as string, undefined, offset).then((messages) => {
            console.log(messages);
        }).catch((err) => {
            console.error(err);
        });
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
        }
        if (offset) {
            body.offset = offset;
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
                return response.ok;
            } else {
                return response.json();
            }
        });
    }

    private clearMessages() {
        while (this.messageContainerElt.firstChild) {
            this.messageContainerElt.removeChild(this.messageContainerElt.firstChild);
        }
    }
}
