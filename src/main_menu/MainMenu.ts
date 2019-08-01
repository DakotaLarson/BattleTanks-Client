import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

import { PerspectiveCamera } from "three";
import MenuCamera from "../arena/camera/MenuCamera";
import AudioType from "../audio/AudioType";
import DOMMutationHandler from "../DOMMutationHandler";
import GameSuggestion from "./GameSuggestion";
import Leaderboard from "./Leaderboard";
import PlayButton from "./PlayButton";
import Referrals from "./Referrals";
// import ServerPlayerCount from "./ServerPlayerCount";
import SidePanel from "./side_panel/SidePanel";

export default class MainMenu extends ChildComponent {

    private element: HTMLElement;

    private playButton: PlayButton;

    // private serverPlayercount: ServerPlayerCount;
    private gameSuggestion: GameSuggestion;
    private referrals: Referrals;
    private sidePanel: SidePanel;
    private leaderboard: Leaderboard;
    private menuCamera: MenuCamera;

    private headerContainerElt: HTMLElement;
    private playBtnContainerElt: HTMLElement;

    constructor(version: number, camera: PerspectiveCamera) {
        super();
        this.element = DomHandler.getElement(".main-menu");

        this.headerContainerElt = DomHandler.getElement(".main-menu-header-container", this.element);
        this.playBtnContainerElt = DomHandler.getElement(".play-button-container", this.element);

        this.playButton = new PlayButton(this.playBtnContainerElt);

        // this.serverPlayercount = new ServerPlayerCount(this.element);
        this.gameSuggestion = new GameSuggestion(this.element);
        this.referrals = new Referrals(this.element);
        this.sidePanel = new SidePanel(this.element);
        this.leaderboard = new Leaderboard(this.element);
        this.menuCamera = new MenuCamera(camera);

        this.updateVersionElt(this.element, version);
    }
    public enable() {
        EventHandler.addListener(this, EventHandler.Event.MULTIPLAYER_CONNECT_REQUEST, this.onMpJoinRequest);

        EventHandler.addListener(this, EventHandler.Event.STORE_OPEN, this.onStoreOpen);
        EventHandler.addListener(this, EventHandler.Event.STORE_CLOSE, this.onStoreClose);

        this.attachChild(this.playButton);
        // this.attachChild(this.serverPlayercount);
        this.attachChild(this.gameSuggestion);
        this.attachChild(this.referrals);
        this.attachChild(this.sidePanel);
        this.attachChild(this.leaderboard);
        this.attachChild(this.menuCamera);

        DOMMutationHandler.show(this.element);
        this.onStoreClose();

    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.MULTIPLAYER_CONNECT_REQUEST, this.onMpJoinRequest);

        EventHandler.removeListener(this, EventHandler.Event.STORE_OPEN, this.onStoreOpen);
        EventHandler.removeListener(this, EventHandler.Event.STORE_CLOSE, this.onStoreClose);

        this.detachChild(this.playButton);
        // this.detachChild(this.serverPlayercount);
        this.detachChild(this.gameSuggestion);
        this.detachChild(this.referrals);
        this.detachChild(this.sidePanel);
        this.detachChild(this.leaderboard);
        this.detachChild(this.menuCamera);

        DOMMutationHandler.hide(this.element);
    }

    private onMpJoinRequest() {
        this.playValidate();
    }

    private onStoreOpen() {
        DOMMutationHandler.addStyle(this.headerContainerElt, "display", "none");
        DOMMutationHandler.addStyle(this.playBtnContainerElt, "display", "none");
    }

    private onStoreClose() {
        DOMMutationHandler.removeStyle(this.headerContainerElt, "display");
        DOMMutationHandler.removeStyle(this.playBtnContainerElt, "display");
    }

    // private playReturn() {
    //     EventHandler.callEvent(EventHandler.Event.AUDIO_PLAY, AudioType.MENU_BACK);
    // }

    // private playSelect() {
    //     EventHandler.callEvent(EventHandler.Event.AUDIO_PLAY, AudioType.MENU_SELECT);
    // }

    private playValidate() {
        EventHandler.callEvent(EventHandler.Event.AUDIO_PLAY, AudioType.MENU_VALIDATE);
    }

    // private playHover() {
    //     const audio = new Audio(location.pathname + "audio/menu-hover.wav");
    //     audio.play();
    // }

    private updateVersionElt(parentElt: HTMLElement, version: number) {
        const elt = DomHandler.getElement(".main-menu-version", parentElt);

        elt.textContent = "v" + version;
    }
}
