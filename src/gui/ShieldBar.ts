import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

export default class ShieldBar extends ChildComponent {

    private shieldContainer: HTMLElement;
    private shieldParent: HTMLElement;
    private bar: HTMLElement;

    constructor(parentElt: HTMLElement) {
        super();

        this.shieldContainer = DomHandler.getElement(".shield-bar-container", parentElt);
        this.shieldParent = DomHandler.getElement("#shield-parent", this.shieldContainer);
        this.bar = DomHandler.getElement(".shield-bar", this.shieldParent);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.PLAYER_SHIELD_CHANGE, this.onShieldChange);
        this.shieldContainer.style.display = "block";
        this.setPercentage(0);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.PLAYER_SHIELD_CHANGE, this.onShieldChange);
        this.shieldContainer.style.display = "";
    }

    private onShieldChange(shield: number) {
        this.setPercentage(shield * 100);
    }

    private setPercentage(percentage: number) {
        this.bar.style.width = "" + percentage + "%";
    }
}
