import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

export default class RamBar extends ChildComponent {

    private static readonly COOLDOWN_TIME = 7500;

    private static readonly PREPARING_COLOR = "#ffc107";
    private static readonly READY_COLOR = "#ff9800";
    private static readonly STARTING_COLOR = "#ff5722";

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
        this.ramParent.style.display = "block";
        this.setPercentage(100);
        this.setColor(RamBar.READY_COLOR);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.PLAYER_RAM, this.onRam);
        if (this.listening) {
            EventHandler.removeListener(this, EventHandler.Event.GAME_TICK, this.onTick);
            this.listening = false;
        }
        this.ramParent.style.display = "";
    }

    private onRam(data: any) {
        const startTime = data.startTime;
        const currentTime = Date.now();

        if (currentTime >= startTime) {
            this.enableRam(startTime);
        } else {
            setTimeout(() => {
                this.enableRam(startTime);
            }, startTime - currentTime);
            this.setColor(RamBar.STARTING_COLOR);
        }

    }

    private enableRam(startTime: number) {
        this.startTime = startTime;
        EventHandler.addListener(this, EventHandler.Event.GAME_TICK, this.onTick);
        this.setColor(RamBar.PREPARING_COLOR);
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
        this.setColor(RamBar.READY_COLOR);
    }

    private updateBar(currentTime: number, startTime: number) {
        const timeElapsed = currentTime - startTime;
        const percentage = timeElapsed / RamBar.COOLDOWN_TIME;
        this.setPercentage(percentage * 100);
    }

    private setPercentage(percentage: number) {
        this.bar.style.width = "" + percentage + "%";
    }

    private setColor(color: string) {
        this.bar.style.backgroundColor = color;
    }
}
