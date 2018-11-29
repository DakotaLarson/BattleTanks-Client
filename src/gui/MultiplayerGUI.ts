import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import Options from "../Options";
import AmmoDisplay from "./AmmoDisplay";
import Chat from "./Chat";
import DebugPanel from "./DebugPanel";
import FullscreenToggle from "./FullscreenToggle";
import HealthBar from "./HealthBar";
import Killfeed from "./Killfeed";

export default class GUI extends Component {

    private element: HTMLElement;
    private debugPanel: DebugPanel;
    private fullscreenToggle: FullscreenToggle;
    private healthBar: HealthBar;
    private ammoDisplay: AmmoDisplay;
    private killfeed: Killfeed;
    private chat: Chat;

    constructor() {
        super();
        this.element = DomHandler.getElement(".gui");

        this.debugPanel = new DebugPanel(this.element);
        this.fullscreenToggle = new FullscreenToggle(this.element);
        this.ammoDisplay = new AmmoDisplay(this.element);
        this.healthBar = new HealthBar(this.element);
        this.killfeed = new Killfeed(this.element);
        this.chat = new Chat(this.element);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.addListener(this, EventHandler.Event.PLAYER_REMOVAL, this.onPlayerRemoval);

        EventHandler.addListener(this, EventHandler.Event.PLAYER_SPECTATING, this.onPlayerRemoval);

        this.attachChild(this.debugPanel);
        this.attachChild(this.fullscreenToggle);

        if (Options.options.killfeedEnabled) {
            this.attachChild(this.killfeed);
        }
        if (Options.options.chatEnabled) {
            this.attachChild(this.chat);
        }

        this.element.style.display = "block";
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.removeListener(this, EventHandler.Event.PLAYER_REMOVAL, this.onPlayerRemoval);

        EventHandler.removeListener(this, EventHandler.Event.PLAYER_SPECTATING, this.onPlayerRemoval);

        this.detachChild(this.debugPanel);
        this.detachChild(this.fullscreenToggle);
        this.detachChild(this.killfeed);
        this.detachChild(this.chat);

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
