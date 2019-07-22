import AudioType from "../audio/AudioType";
import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import DOMMutationHandler from "../DOMMutationHandler";
import EventHandler from "../EventHandler";

export default class AmmoDisplay extends ChildComponent {

    private container: HTMLElement;
    private countElt: HTMLElement;
    private circle: HTMLElement;

    private circumference: number;
    private ammoCount: number;
    private reloadPercentage: number;

    constructor(parent: HTMLElement) {
        super();

        this.container = DomHandler.getElement(".ammo-display-container", parent);
        this.countElt = DomHandler.getElement(".ammo-count", this.container);
        this.circle = DomHandler.getElement(".ammo-circle", this.container);
        this.circumference = Math.PI * 2 * parseInt(this.circle.getAttribute("r") as string, 10);
        this.reloadPercentage = 1;
        this.ammoCount = 0;

    }

    public enable() {

        EventHandler.addListener(this, EventHandler.Event.PLAYER_AMMO_STATUS, this.onAmmoStatusChange);
        EventHandler.addListener(this, EventHandler.Event.PLAYER_RELOAD_START, this.onReloadStart);
        EventHandler.addListener(this, EventHandler.Event.PLAYER_RELOAD_END, this.onReloadEnd);
        DOMMutationHandler.show(this.container);

        this.ammoCount = 0;
        this.reloadPercentage = 1;
        this.update();
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.PLAYER_AMMO_STATUS, this.onAmmoStatusChange);
        EventHandler.removeListener(this, EventHandler.Event.PLAYER_RELOAD_START, this.onReloadStart);
        EventHandler.removeListener(this, EventHandler.Event.PLAYER_RELOAD_END, this.onReloadEnd);
        DOMMutationHandler.hide(this.container);
    }

    private onAmmoStatusChange(data: any) {
        this.ammoCount = data.ammoCount;
        this.reloadPercentage = data.reloadPercentage;
        this.update();
    }

    private onReloadStart() {
        EventHandler.callEvent(EventHandler.Event.AUDIO_PLAY, AudioType.GAME_RELOAD_START);
    }

    private onReloadEnd() {
        EventHandler.callEvent(EventHandler.Event.AUDIO_PLAY, AudioType.GAME_RELOAD_END);
    }

    private update() {
        if (this.countElt.textContent !== "" + this.ammoCount) {
            this.countElt.textContent = "" + this.ammoCount;
        }

        const dashoffset = this.circumference * (1 - this.reloadPercentage);
        this.circle.style.strokeDashoffset = "" + dashoffset;
    }
}
