import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import Globals from "../Globals";
import PacketSender from "../PacketSender";

export default class Chat extends ChildComponent {

    private static readonly MAX_MESSAGE_COUNT = 100;
    private container: HTMLElement;
    private messageContainer: HTMLElement;
    private inputElt: HTMLInputElement;
    private previewContainer: HTMLElement;

    constructor(parent: HTMLElement) {
        super();

        this.container = DomHandler.getElement(".chat-container", parent);
        this.messageContainer = DomHandler.getElement(".chat-message-container", this.container);
        this.inputElt = DomHandler.getElement(".chat-input", this.container) as HTMLInputElement;
        this.previewContainer = DomHandler.getElement(".chat-preview-container", parent);
        Globals.setGlobal(Globals.Global.CHAT_OPEN, false);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_KEYDOWN, this.onKeyDown);
        EventHandler.addListener(this, EventHandler.Event.DOM_KEYUP, this.onKeyUp);
        EventHandler.addListener(this, EventHandler.Event.CHAT_UPDATE, this.onUpdate);
        this.previewContainer.style.display = "block";
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_KEYDOWN, this.onKeyDown);
        EventHandler.addListener(this, EventHandler.Event.DOM_KEYUP, this.onKeyUp);
        EventHandler.removeListener(this, EventHandler.Event.CHAT_UPDATE, this.onUpdate);
        this.clearMessages();

        this.hideChat();
        this.previewContainer.style.display = "";
    }

    private onKeyDown(event: KeyboardEvent) {
        if (event.code === "Enter" && !Globals.getGlobal(Globals.Global.GAME_MENU_OPEN)) {
            if (Globals.getGlobal(Globals.Global.CHAT_OPEN)) {
                this.sendMessage();
                this.hideChat();
            } else {
                this.showChat();
            }
        }
    }

    private onKeyUp(event: KeyboardEvent) {
        if (event.code === "Escape" && Globals.getGlobal(Globals.Global.CHAT_OPEN) && !Globals.getGlobal(Globals.Global.GAME_MENU_OPEN)) {
            this.hideChat();
        }
    }

    private onUpdate(data: any) {
        const newMessageElt = this.constructChatMessage(data);
        this.messageContainer.appendChild(newMessageElt);
        this.removeOldMessages(this.messageContainer);
        if (!Globals.getGlobal(Globals.Global.CHAT_OPEN)) {
            const previewMessageElt = newMessageElt.cloneNode(true) as HTMLElement;
            this.previewContainer.appendChild(previewMessageElt);
            this.removeOldMessages(this.previewContainer);
            this.previewContainer.scrollTop = this.previewContainer.scrollHeight;
            setTimeout(() => {
                if (this.previewContainer.contains(previewMessageElt)) {
                    previewMessageElt.style.opacity = "0";
                    setTimeout(() => {
                        if (this.previewContainer.contains(previewMessageElt)) {
                            this.previewContainer.removeChild(previewMessageElt);
                        }
                    }, 500);
                }
            }, 5000);
        }
    }

    private sendMessage() {
        const message = this.inputElt.value.trim();
        if (message) {
            PacketSender.sendChatMessage(message);
        }
    }

    private showChat() {
        this.hidePreview();
        this.container.style.display = "flex";
        this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
        this.inputElt.focus();
        Globals.setGlobal(Globals.Global.CHAT_OPEN, true);
        EventHandler.callEvent(EventHandler.Event.CHAT_OPEN);
    }

    private hideChat() {
        this.inputElt.value = "";
        this.container.style.display = "";
        this.previewContainer.style.display = "block";
        Globals.setGlobal(Globals.Global.CHAT_OPEN, false);
    }

    private hidePreview() {
        while (this.previewContainer.firstChild) {
            this.previewContainer.removeChild(this.previewContainer.firstChild);
        }
        this.previewContainer.style.display = "";
    }

    private clearMessages() {
        while (this.messageContainer.firstChild) {
            this.messageContainer.removeChild(this.messageContainer.firstChild);
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

    private removeOldMessages(container: HTMLElement) {
        while (container.childElementCount > Chat.MAX_MESSAGE_COUNT) {
            container.removeChild(container.firstChild as Node);
        }
    }
}
