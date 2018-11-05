import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import DebugPanel from "./DebugPanel";
import HealthBar from "./HealthBar";

export default class GUI extends Component {

    private element: HTMLElement;
    private debugPanel: DebugPanel;
    // private cooldownBar: CooldownBar;
    private healthBar: HealthBar;

    constructor() {
        super();
        this.element = DomHandler.getElement(".gui");

        this.debugPanel = new DebugPanel(this.element);

        // this.cooldownBar = new CooldownBar(this.element);

        this.healthBar = new HealthBar(this.element);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_REMOVAL, this.onPlayerRemoval);

        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_SPECTATING, this.onPlayerRemoval);

        this.attachChild(this.debugPanel);

        this.element.style.display = "block";
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_REMOVAL, this.onPlayerRemoval);

        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_SPECTATING, this.onPlayerRemoval);

        this.detachChild(this.debugPanel);

        this.element.style.display = "";
    }

    private onPlayerAddition() {
        // this.attachChild(this.cooldownBar);
        this.attachChild(this.healthBar);
    }

    private onPlayerRemoval() {
        // this.detachChild(this.cooldownBar);
        this.detachChild(this.healthBar);
    }
}
