import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import PacketSender from "../PacketSender";

export default class Chat extends ChildComponent {

    private container: HTMLElement;
    private messageContaner: HTMLElement;
    private inputElt: HTMLInputElement;

    private visible: boolean;

    constructor(parent: HTMLElement) {
        super();

        this.container = DomHandler.getElement(".chat-container", parent);
        this.messageContaner = DomHandler.getElement(".chat-message-container", this.container);
        this.inputElt = DomHandler.getElement(".chat-input", this.container) as HTMLInputElement;
        this.visible = false;
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_KEYDOWN, this.onKeyDown);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_KEYDOWN, this.onKeyDown);
        this.clearMessages();
    }

    private onKeyDown(event: KeyboardEvent) {
        if (event.code === "Enter") {
            if (this.visible) {
                this.sendMessage();
                this.hideChat();
            } else {
                this.showChat();
            }
        }
    }

    private sendMessage() {
        const message = this.inputElt.value.trim();
        if (message) {
            PacketSender.sendChatMessageSend(message);
        }
    }

    private showChat() {
        this.container.style.display = "block";
        this.inputElt.focus();
        this.visible = true;
    }

    private hideChat() {
        this.inputElt.value = "";
        this.container.style.display = "";
        this.visible = false;
    }

    private clearMessages() {
        while (this.messageContaner.firstChild) {
            this.messageContaner.removeChild(this.messageContaner.firstChild);
        }
    }
}
