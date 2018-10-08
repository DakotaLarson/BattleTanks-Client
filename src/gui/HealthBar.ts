import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

export default class HealthBar extends ChildComponent {

    private healthContainer: HTMLElement;
    private healthParent: HTMLElement;
    private bar: HTMLElement;

    constructor(parentElt: HTMLElement) {
        super();

        this.healthContainer = DomHandler.getElement(".health-bar-container", parentElt);
        this.healthParent = DomHandler.getElement("#health-parent", this.healthContainer);
        this.bar = DomHandler.getElement(".health-bar", this.healthParent);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_HEALTH_CHANGE, this.onHealthChange);
        this.healthContainer.style.display = "block";
        this.setPercentage(100);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_HEALTH_CHANGE, this.onHealthChange);
        this.healthContainer.style.display = "";
    }

    private onHealthChange(health: number) {
        this.setPercentage(health * 100);
    }

    private setPercentage(percentage: number) {
        this.bar.style.width = "" + percentage + "%";
    }
}
