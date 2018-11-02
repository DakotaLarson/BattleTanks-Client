import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import CooldownBar from "./CooldownBar";
import DebugPanel from "./DebugPanel";
import HealthBar from "./HealthBar";

export default class GUI extends Component {

    private element: HTMLElement;
    private debugPanel: DebugPanel;
    private cooldownBar: CooldownBar;
    private healthBar: HealthBar;

    constructor() {
        super();
        this.element = DomHandler.getElement(".gui");

        this.debugPanel = new DebugPanel(this.element);

        this.cooldownBar = new CooldownBar(this.element);

        this.healthBar = new HealthBar(this.element);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.GAME_STATUS_RUNNING, this.onRunning);
        EventHandler.addListener(this, EventHandler.Event.GAME_STATUS_WAITING, this.onNotRunning);
        EventHandler.addListener(this, EventHandler.Event.GAME_STATUS_STARTING, this.onNotRunning);

        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_SPECTATING, this.onNotRunning);

        this.attachChild(this.debugPanel);

        this.element.style.display = "block";
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.GAME_STATUS_RUNNING, this.onRunning);
        EventHandler.removeListener(this, EventHandler.Event.GAME_STATUS_WAITING, this.onNotRunning);
        EventHandler.removeListener(this, EventHandler.Event.GAME_STATUS_STARTING, this.onNotRunning);

        this.detachChild(this.debugPanel);

        this.element.style.display = "";
    }

    private onRunning() {
        this.attachChild(this.cooldownBar);
        this.attachChild(this.healthBar);
    }

    private onNotRunning() {
        this.detachChild(this.cooldownBar);
        this.detachChild(this.healthBar);
    }
}
