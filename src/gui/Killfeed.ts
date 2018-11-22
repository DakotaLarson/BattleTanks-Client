import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

export default class Killfeed extends ChildComponent {

    private static readonly MAX_MESSAGE_COUNT = 10;

    private container: HTMLElement;

    constructor(parentElt: HTMLElement) {
        super();

        this.container = DomHandler.getElement(".killfeed-container", parentElt);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.KILLFEED_UPDATE, this.onUpdate);
        EventHandler.addListener(this, EventHandler.Event.GAME_STATUS_WAITING, this.clearMessages);
        EventHandler.addListener(this, EventHandler.Event.GAME_STATUS_STARTING, this.clearMessages);
        this.container.style.display = "block";
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.KILLFEED_UPDATE, this.onUpdate);
        EventHandler.removeListener(this, EventHandler.Event.GAME_STATUS_WAITING, this.clearMessages);
        EventHandler.removeListener(this, EventHandler.Event.GAME_STATUS_STARTING, this.clearMessages);

        this.clearMessages();

        this.container.style.display = "";
    }

    private onUpdate(data: any) {
        const mainPlayer = data.mainPlayer;
        const involvedPlayer = data.involvedPlayer;

        const element = document.createElement("div");
        element.classList.add("killfeed-message");

        if (involvedPlayer) {
            element.appendChild(this.createPlayerElement(involvedPlayer));
            element.appendChild(this.createActionElement(false));
            element.appendChild(this.createPlayerElement(mainPlayer));
            element.appendChild(this.createLivesRemainingElement(mainPlayer.livesRemaining));
        } else {
            element.appendChild(this.createPlayerElement(mainPlayer));
            element.appendChild(this.createActionElement(true));
        }
        this.addMessage(element);
    }

    private addMessage(element: HTMLElement) {

        this.container.appendChild(element);
        setTimeout(() => {
            if (this.container.contains(element)) {
                element.style.opacity = "0";
                setTimeout(() => {
                    if (this.container.contains(element)) {
                        this.container.removeChild(element);
                    }
                }, 500);
            }
        }, 5000);

        while (this.container.childElementCount > Killfeed.MAX_MESSAGE_COUNT) {
            this.container.removeChild(this.container.firstChild as Node);
        }
    }

    private createPlayerElement(player: any) {
        const element = document.createElement("span");
        element.textContent = player.name;
        element.style.color = this.getCSSColorString(player.color);
        if (player.isSelf) {
            element.style.textDecoration = "underline";
        }
        return element;
    }

    private createActionElement(isSelf: boolean) {
        const element = document.createElement("span");
        element.style.color = "#f0f0f0";
        element.style.fontStyle = "italic";
        if (isSelf) {
            element.textContent = " left the game";
        } else {
            element.textContent = " killed ";
        }
        return element;
    }

    private createLivesRemainingElement(livesRemaining: number) {
        const element = document.createElement("span");
        element.style.color = "#f0f0f0";
        if (livesRemaining) {
            element.textContent = " (" + livesRemaining + ")";
        } else {
            element.textContent = " (KO)";
        }
        return element;
    }

    private getCSSColorString(value: number) {
        let cssValue = value.toString(16);
        while (cssValue.length < 6) {
            cssValue = "0" + cssValue;
        }
        return "#" + cssValue;
    }

    private clearMessages() {
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
    }
}
