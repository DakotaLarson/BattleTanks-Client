import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import CooldownBar from "./CooldownBar";
import DebugPanel from "./DebugPanel";

export default class GUI extends Component {

    public element: HTMLElement;
    public debugPanel: DebugPanel;
    private cooldownBar: CooldownBar | undefined;
    constructor() {
        super();
        this.element = DomHandler.getElement(".gui");

        this.debugPanel = new DebugPanel(this.element);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.COOLDOWN_TIME_RECEPTION, this.onCooldownTimeReception);
        EventHandler.addListener(this, EventHandler.Event.GAME_STATUS_FINISHING, this.onFinish);

        this.attachChild(this.debugPanel);

        this.element.style.display = "block";
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.COOLDOWN_TIME_RECEPTION, this.onCooldownTimeReception);
        EventHandler.removeListener(this, EventHandler.Event.GAME_STATUS_FINISHING, this.onFinish);

        this.detachChild(this.debugPanel);

        this.element.style.display = "";
    }

    public onCooldownTimeReception(time: number) {
        this.cooldownBar = new CooldownBar(this.element, time);
        this.attachChild(this.cooldownBar);
    }

    public onFinish() {
        this.detachChild(this.cooldownBar as CooldownBar);
        this.cooldownBar = undefined;
    }
}
