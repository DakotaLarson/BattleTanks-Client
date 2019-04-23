import Component from "../component/Component";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

import { PerspectiveCamera } from "three";
import MenuCamera from "../arena/camera/MenuCamera";
import AudioType from "../audio/AudioType";
import ChildComponent from "../component/ChildComponent";
import DOMMutationHandler from "../DOMMutationHandler";
import CreateWorldMenu from "./CreateArenaMenu";
import GameSuggestion from "./GameSuggestion";
import Leaderboard from "./Leaderboard";
import LoadWorldMenu from "./LoadArenaMenu";
import PlayerStats from "./PlayerStats";
import ServerPlayerCount from "./ServerPlayerCount";
import SidePanel from "./side_panel/SidePanel";
import SingleplayerMenu from "./SingleplayerMenu";
import TopMenu from "./TopMenu";

export default class MainMenu extends Component {

    private element: HTMLElement;

    private topMenu: TopMenu;

    private serverPlayercount: ServerPlayerCount;
    private gameSuggestion: GameSuggestion;
    private sidePanel: SidePanel;
    private playerStats: PlayerStats;
    private leaderboard: Leaderboard;
    private menuCamera: MenuCamera;

    private attachedCmp: ChildComponent | undefined;

    constructor(camera: PerspectiveCamera) {
        super();
        this.element = DomHandler.getElement(".main-menu");

        this.topMenu = new TopMenu(this.element);

        this.serverPlayercount = new ServerPlayerCount(this.element);
        this.gameSuggestion = new GameSuggestion(this.element);
        this.sidePanel = new SidePanel(this.element);
        this.playerStats = new PlayerStats(this.element);
        this.leaderboard = new Leaderboard(this.element);
        this.menuCamera = new MenuCamera(camera);
    }
    public enable() {
        // MP MENU
        EventHandler.addListener(this, EventHandler.Event.MULTIPLAYER_CONNECT_REQUEST, this.onMpJoinOptClick);

        this.attach(this.topMenu);

        this.attachChild(this.serverPlayercount);
        this.attachChild(this.gameSuggestion);
        this.attachChild(this.sidePanel);
        this.attachChild(this.playerStats);
        this.attachChild(this.leaderboard);
        this.attachChild(this.menuCamera);

        DOMMutationHandler.show(this.element);
    }

    public disable() {

        // MP MENU
        EventHandler.removeListener(this, EventHandler.Event.MULTIPLAYER_CONNECT_REQUEST, this.onMpJoinOptClick);

        this.detachChild(this.serverPlayercount);
        this.detachChild(this.gameSuggestion);
        this.detachChild(this.sidePanel);
        this.detachChild(this.playerStats);
        this.detachChild(this.leaderboard);
        this.detachChild(this.menuCamera);

        DOMMutationHandler.hide(this.element);
    }

    private onMpJoinOptClick() {
        this.attachedCmp = undefined;
        this.playValidate();
    }

    private attach(cmp: ChildComponent) {
        if (this.attachedCmp) {
            this.detachChild(this.attachedCmp);
        }

        this.attachChild(cmp);
        this.attachedCmp = cmp;
    }

    private playReturn() {
        EventHandler.callEvent(EventHandler.Event.AUDIO_PLAY, AudioType.MENU_BACK);
    }

    private playSelect() {
        EventHandler.callEvent(EventHandler.Event.AUDIO_PLAY, AudioType.MENU_SELECT);
    }

    private playValidate() {
        EventHandler.callEvent(EventHandler.Event.AUDIO_PLAY, AudioType.MENU_VALIDATE);
    }

    // private playHover() {
    //     const audio = new Audio(location.pathname + "audio/menu-hover.wav");
    //     audio.play();
    // }
}
