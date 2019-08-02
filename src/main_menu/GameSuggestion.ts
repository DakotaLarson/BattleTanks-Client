import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import Globals from "../Globals";

export default class GameSuggestion extends ChildComponent {

    private static readonly MESSAGE_INTERVAL = 7500;

    private element: HTMLElement;
    private taskId: number | undefined;

    constructor(menu: HTMLElement) {
        super();
        this.element = DomHandler.getElement(".game-suggestion", menu);
    }

    public enable() {
        this.taskId = this.cycleMessages();
    }

    public disable() {
        window.clearInterval(this.taskId);
    }

    private cycleMessages() {
        const tips = Globals.getGlobal(Globals.Global.TIPS);
        let messageIndex = this.getRandomInt(0, tips.length);
        this.updateMessage(messageIndex);

        return window.setInterval(() => {
            messageIndex = this.getNextMessageIndex(messageIndex);
            this.updateMessage(messageIndex);
        }, GameSuggestion.MESSAGE_INTERVAL);
    }

    private updateMessage(messageIndex: number) {
        const tips = Globals.getGlobal(Globals.Global.TIPS);
        this.element.textContent = tips[messageIndex];
        this.toggleClasses();
        window.setTimeout(() => {
            this.toggleClasses();
        }, GameSuggestion.MESSAGE_INTERVAL - 1000);
    }

    private getNextMessageIndex(lastMessageIndex: number) {
        const tips = Globals.getGlobal(Globals.Global.TIPS);
        let newMessageIndex;
        do {
            newMessageIndex = this.getRandomInt(0, tips.length);
        } while (newMessageIndex === lastMessageIndex);
        return newMessageIndex;
    }

    private getRandomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    private toggleClasses() {
        this.element.classList.toggle("game-suggestion-hidden");
        this.element.classList.toggle("game-suggestion-visible");
    }
}
