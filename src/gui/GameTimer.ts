import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

export default class GameTimer extends ChildComponent {

    private parentElt: HTMLElement;
    private textElt: HTMLElement;

    constructor() {
        super();

        this.parentElt = DomHandler.getElement(".game-timer");
        this.textElt = DomHandler.getElement(".game-timer-text", this.parentElt);
    }

    public enable() {

        EventHandler.addListener(this, EventHandler.Event.GAME_TIMER_UPDATE, this.onUpdate);

        this.textElt.textContent = "00:00";
        this.parentElt.style.display = "flex";
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.GAME_TIMER_UPDATE, this.onUpdate);

        this.parentElt.style.display = "";
    }

    private onUpdate(time: number) {
        const minutes = Math.floor(time / 60);
        const seconds = time - minutes * 60;

        const minutesText = minutes < 10 ? "0" + minutes : "" + minutes;
        const secondsText = seconds < 10 ? "0" + seconds : "" + seconds;

        this.textElt.textContent = minutesText + ":" + secondsText;
    }
}
