import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import AmmoDisplay from "./AmmoDisplay";
import DebugPanel from "./DebugPanel";
import HealthBar from "./HealthBar";
import Killfeed from "./Killfeed";

export default class GUI extends Component {

    private element: HTMLElement;
    private debugPanel: DebugPanel;
    private healthBar: HealthBar;
    private ammoDisplay: AmmoDisplay;
    private killfeed: Killfeed;

    constructor() {
        super();
        this.element = DomHandler.getElement(".gui");

        this.debugPanel = new DebugPanel(this.element);
        this.ammoDisplay = new AmmoDisplay(this.element);
        this.healthBar = new HealthBar(this.element);
        this.killfeed = new Killfeed(this.element);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.addListener(this, EventHandler.Event.PLAYER_REMOVAL, this.onPlayerRemoval);

        EventHandler.addListener(this, EventHandler.Event.PLAYER_SPECTATING, this.onPlayerRemoval);

        this.attachChild(this.debugPanel);
        this.attachChild(this.killfeed);

        this.element.style.display = "block";
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.removeListener(this, EventHandler.Event.PLAYER_REMOVAL, this.onPlayerRemoval);

        EventHandler.removeListener(this, EventHandler.Event.PLAYER_SPECTATING, this.onPlayerRemoval);

        this.detachChild(this.debugPanel);
        this.detachChild(this.killfeed);

        this.element.style.display = "";
    }

    private onPlayerAddition() {
        this.attachChild(this.healthBar);
        this.attachChild(this.ammoDisplay);
    }

    private onPlayerRemoval() {
        this.detachChild(this.healthBar);
        this.detachChild(this.ammoDisplay);
    }
}
