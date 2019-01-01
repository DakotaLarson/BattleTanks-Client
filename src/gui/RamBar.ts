import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

export default class RamBar extends ChildComponent {

    private static readonly COOLDOWN_TIME = 7500;

    private ramParent: HTMLElement;
    private bar: HTMLElement;

    private startTime: number;
    private listening: boolean;

    constructor(parentElt: HTMLElement) {
        super();

        this.ramParent = DomHandler.getElement("#ram-parent", parentElt);
        this.bar = DomHandler.getElement(".ram-bar", this.ramParent);

        this.startTime = 0;
        this.listening = false;
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.PLAYER_RAM, this.onRam);
        this.ramParent.style.display = "inline-block";
        this.setPercentage(100);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.PLAYER_RAM, this.onRam);
        if (this.listening) {
            EventHandler.removeListener(this, EventHandler.Event.GAME_TICK, this.onTick);
            this.listening = false;
        }
        this.ramParent.style.display = "";
    }

    private onRam() {
        this.startTime = Date.now();
        EventHandler.addListener(this, EventHandler.Event.GAME_TICK, this.onTick);
        this.listening = true;
    }

    private onTick() {
        const currentTime = Date.now();
        if (currentTime > this.startTime + RamBar.COOLDOWN_TIME) {
            this.disableRam();
        } else if (currentTime >= this.startTime) {
            this.updateBar(currentTime, this.startTime);
        }
    }

    private disableRam() {
        EventHandler.removeListener(this, EventHandler.Event.GAME_TICK, this.onTick);
        this.listening = false;
        this.setPercentage(100);
    }

    private updateBar(currentTime: number, startTime: number) {
        const timeElapsed = currentTime - startTime;
        const percentage = timeElapsed / RamBar.COOLDOWN_TIME;
        this.setPercentage(percentage * 100);
    }

    private setPercentage(percentage: number) {
        this.bar.style.width = "" + percentage + "%";
    }
}
