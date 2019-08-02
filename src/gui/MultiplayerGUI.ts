import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import DOMMutationHandler from "../DOMMutationHandler";
import EventHandler from "../EventHandler";
import Options from "../Options";
import AmmoDisplay from "./AmmoDisplay";
import Chat from "./Chat";
import DebugPanel from "./DebugPanel";
import GameTips from "./GameTips";
import HealthBar from "./HealthBar";
import Joystick from "./Joystick";
import Killfeed from "./Killfeed";
import LobbyCode from "./LobbyCode";
import PlayerList from "./PlayerList";
import RamBar from "./RamBar";
import ShieldBar from "./ShieldBar";

export default class GUI extends Component {

    private element: HTMLElement;

    private debugPanel: DebugPanel;
    private healthBar: HealthBar;
    private shieldBar: ShieldBar;
    private ramBar: RamBar;
    private ammoDisplay: AmmoDisplay;
    private killfeed: Killfeed;
    private joystick: Joystick;
    private chat: Chat;
    private playerList: PlayerList;
    private lobbyCode: LobbyCode;
    private gameTips: GameTips;

    constructor() {
        super();
        this.element = DomHandler.getElement(".gui");

        this.debugPanel = new DebugPanel(this.element);
        this.ammoDisplay = new AmmoDisplay(this.element);
        this.healthBar = new HealthBar(this.element);
        this.shieldBar = new ShieldBar(this.element);
        this.ramBar = new RamBar(this.element);
        this.killfeed = new Killfeed(this.element);
        this.joystick = new Joystick(this.element);
        this.chat = new Chat(this.element);
        this.playerList = new PlayerList(this.element);
        this.lobbyCode = new LobbyCode();
        this.gameTips = new GameTips(this.element);

    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.addListener(this, EventHandler.Event.PLAYER_REMOVAL, this.onPlayerRemoval);

        this.attachChild(this.debugPanel);

        if (Options.options.killfeedEnabled) {
            this.attachChild(this.killfeed);
        }
        if (Options.options.chatEnabled) {
            this.attachChild(this.chat);
        }

        this.attachChild(this.playerList);
        this.attachChild(this.lobbyCode);

        DOMMutationHandler.show(this.element);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.removeListener(this, EventHandler.Event.PLAYER_REMOVAL, this.onPlayerRemoval);

        this.detachChild(this.debugPanel);
        this.detachChild(this.killfeed);
        this.detachChild(this.chat);
        this.detachChild(this.playerList);
        this.detachChild(this.lobbyCode);

        DOMMutationHandler.hide(this.element);
    }

    private onPlayerAddition() {
        this.attachChild(this.healthBar);
        this.attachChild(this.shieldBar);
        this.attachChild(this.ramBar);
        this.attachChild(this.ammoDisplay);

        if (DomHandler.supportsTouch()) {
            this.attachChild(this.joystick);
        }

        this.detachChild(this.gameTips);
    }

    private onPlayerRemoval() {
        this.detachChild(this.healthBar);
        this.detachChild(this.shieldBar);
        this.detachChild(this.ramBar);
        this.detachChild(this.ammoDisplay);
        this.detachChild(this.joystick);

        if (Options.options.gameTipsEnabled) {
            this.attachChild(this.gameTips);
        }
    }
}
