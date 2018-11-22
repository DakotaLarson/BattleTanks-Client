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
        EventHandler.addListener(this, EventHandler.Event.CHAT_UPDATE, this.onUpdate);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_KEYDOWN, this.onKeyDown);
        EventHandler.removeListener(this, EventHandler.Event.CHAT_UPDATE, this.onUpdate);
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

    private onUpdate(data: any) {
        const newMessageElt = this.constructChatMessage(data);
        this.messageContaner.appendChild(newMessageElt);
    }

    private sendMessage() {
        const message = this.inputElt.value.trim();
        if (message) {
            PacketSender.sendChatMessage(message);
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

    private constructChatMessage(data: any) {
        const elements = [];
        for (const segment of data) {
            const element = document.createElement("span");
            element.textContent = segment.text;
            element.style.color = this.getCSSColorString(segment.color);
            elements.push(element);
        }

        const messageElt = document.createElement("div");
        messageElt.classList.add("chat-message");
        for (const element of elements) {
            messageElt.appendChild(element);
        }

        return messageElt;
    }

    private getCSSColorString(value: number) {
        let cssValue = value.toString(16);
        while (cssValue.length < 6) {
            cssValue = "0" + cssValue;
        }
        return "#" + cssValue;
    }
}
