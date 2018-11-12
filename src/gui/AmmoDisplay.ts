import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
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

        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_AMMO_STATUS, this.onAmmoStatusChange);
        this.container.style.display = "block";

        this.ammoCount = 0;
        this.reloadPercentage = 1;
        this.update();
    }

    public disable() {
        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_AMMO_STATUS, this.onAmmoStatusChange);
        this.container.style.display = "";
    }

    private onAmmoStatusChange(data: any) {
        this.ammoCount = data.ammoCount;
        this.reloadPercentage = data.reloadPercentage;
        this.update();
    }

    private update() {
        if (this.countElt.textContent !== "" + this.ammoCount) {
            this.countElt.textContent = "" + this.ammoCount;
        }

        const dashoffset = this.circumference * (1 - this.reloadPercentage);
        this.circle.style.strokeDashoffset = "" + dashoffset;
    }

}
