import {AudioListener, PerspectiveCamera} from "three";

import AudioHandler from "../audio/AudioHandler";
import Component from "../component/Component";
import EventHandler from "../EventHandler";
import MultiplayerGameMenu from "../game_menu/MultiplayerGameMenu";
import SingleplayerGameMenu from "../game_menu/SingleplayerGameMenu";
import Globals from "../Globals";
import MultiplayerGUI from "../gui/MultiplayerGUI";
import SingleplayerGUI from "../gui/SingleplayerGUI";
import RaycastHandler from "../RaycastHandler";
import Renderer from "../Renderer";
import MultiplayerArena from "./arena/MultiplayerArena";
import SingleplayerArena from "./arena/SinglePlayerArena";
import MultiplayerCamera from "./camera/multiplayer/MultiplayerCamera";
import SingleplayerCamera from "./camera/singleplayer/SingleplayerCamera";
import ProjectileHandler from "./ProjectileHandler";
import SceneHandler from "./scene/SceneHandler";
import CreationToolHandler from "./tools/CreationToolHandler";

export default class ArenaHandler extends Component {

    private sceneHandler: SceneHandler;
    private renderer: Renderer;

    private singleplayerArena: SingleplayerArena;
    private multiplayerArena: MultiplayerArena;

    private creationToolHandler: CreationToolHandler;

    private singleplayerGUI: SingleplayerGUI;
    private multiplayerGUI: MultiplayerGUI;

    private singleplayerGameMenu: SingleplayerGameMenu;
    private multiplayerGameMenu: MultiplayerGameMenu;

    private singleplayerCamera: SingleplayerCamera;
    private multiplayerCamera: MultiplayerCamera;

    private audioHandler: AudioHandler;

    private projectileHandler: ProjectileHandler;

    private isSingleplayer: boolean;
    private gameMenuEnabled: boolean;

    private arenaAttached: boolean;

    constructor() {
        super();

        Globals.setGlobal(Globals.Global.CAMERA_IS_FOLLOWING, true);

        const perspectiveCamera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);
        Globals.setGlobal(Globals.Global.CAMERA, perspectiveCamera);

        const audioListener = new AudioListener();
        perspectiveCamera.add(audioListener);

        RaycastHandler.init();

        this.sceneHandler = new SceneHandler(audioListener);
        this.renderer = new Renderer(this.sceneHandler.getScene(), perspectiveCamera);

        this.singleplayerArena = new SingleplayerArena();
        this.multiplayerArena = new MultiplayerArena();

        this.creationToolHandler = new CreationToolHandler();

        this.singleplayerGUI = new SingleplayerGUI();
        this.multiplayerGUI = new MultiplayerGUI();

        this.singleplayerGameMenu = new SingleplayerGameMenu();
        this.multiplayerGameMenu = new MultiplayerGameMenu();

        this.singleplayerCamera = new SingleplayerCamera(perspectiveCamera);
        this.multiplayerCamera = new MultiplayerCamera(perspectiveCamera);

        this.audioHandler = new AudioHandler(audioListener);

        this.projectileHandler = new ProjectileHandler(this.sceneHandler.getScene());

        this.isSingleplayer = false;
        this.gameMenuEnabled = false;
        this.arenaAttached = false;
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.CREATEWORLDMENU_CREATE_OPT_CLICK, this.attachSingleplayerArena);
        EventHandler.addListener(this, EventHandler.Event.LOADWORLDMENU_LOAD_OPT_CLICK, this.attachSingleplayerArena);

        EventHandler.addListener(this, EventHandler.Event.SP_GAMEMENU_RETURN_TO_MAIN_REQUEST, this.detachSingleplayerArena);

        EventHandler.addListener(this, EventHandler.Event.MPMENU_JOIN_OPT_CLICK, this.attachMultiplayerArena);

        EventHandler.addListener(this, EventHandler.Event.CONNECTION_SCREEN_DISCONNECT, this.detachMultiplayerArena);
        EventHandler.addListener(this, EventHandler.Event.MP_GAMEMENU_DISCONNECT, this.detachMultiplayerArena);
        EventHandler.addListener(this, EventHandler.Event.MULTIPLAYER_CONNECTION_WS_CLOSE, this.detachMultiplayerArena);

        this.attachChild(this.audioHandler);
    }

    private attachSingleplayerArena(worldData: any) {
        this.attachArena();

        this.attachChild(this.singleplayerArena);
        this.attachChild(this.singleplayerGUI);
        this.attachChild(this.creationToolHandler);
        this.attachChild(this.singleplayerCamera);

        worldData.fromServer = false;
        EventHandler.callEvent(EventHandler.Event.ARENA_SCENE_UPDATE, worldData);

        this.isSingleplayer = true;
    }

    private detachSingleplayerArena() {
        this.detachArena();

        this.detachChild(this.singleplayerArena);
        this.detachChild(this.singleplayerGUI);
        this.detachChild(this.creationToolHandler);
        this.detachChild(this.singleplayerCamera);
    }

    private attachMultiplayerArena() {
        this.attachArena();

        this.attachChild(this.multiplayerArena);
        this.attachChild(this.multiplayerGUI);
        this.attachChild(this.multiplayerCamera);
        this.attachChild(this.projectileHandler);

        this.isSingleplayer = false;
    }

    private detachMultiplayerArena() {
        this.detachArena();

        this.detachChild(this.multiplayerArena);
        this.detachChild(this.multiplayerGUI);
        this.detachChild(this.multiplayerCamera);
        this.detachChild(this.projectileHandler);
    }

    private attachArena() {
        EventHandler.addListener(this, EventHandler.Event.DOM_KEYUP, this.onKeyUp);
        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_CLOSE_REQUEST, this.closeGameMenuFromEvent);
        EventHandler.addListener(this, EventHandler.Event.DOM_BLUR, this.onBlur);
        EventHandler.addListener(this, EventHandler.Event.DOM_POINTERLOCK_DISABLE, this.onBlur);

        this.attachChild(this.sceneHandler);
        this.attachChild(this.renderer);
        this.arenaAttached = true;
    }

    private detachArena() {
        if (this.arenaAttached) {
            EventHandler.removeListener(this, EventHandler.Event.DOM_KEYUP, this.onKeyUp);
            EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_CLOSE_REQUEST, this.closeGameMenuFromEvent);
            EventHandler.removeListener(this, EventHandler.Event.DOM_BLUR, this.onBlur);
            EventHandler.removeListener(this, EventHandler.Event.DOM_POINTERLOCK_DISABLE, this.onBlur);

            this.detachChild(this.sceneHandler);
            this.detachChild(this.renderer);

            if (this.gameMenuEnabled) {
                this.closeGameMenu(false);
            }

            this.arenaAttached = false;
        }
    }

    private onKeyUp(event: KeyboardEvent) {
        if (event.code === "Escape") {
            if (this.gameMenuEnabled) {
                this.closeGameMenu(true);
            } else {
                this.openGameMenu();
            }
        }
    }

    private onBlur() {
        if (!this.gameMenuEnabled) {
            this.openGameMenu();
        }
    }

    private closeGameMenuFromEvent() {
        this.closeGameMenu(true);
    }

    private closeGameMenu(callEvent: boolean) {
        if (this.isSingleplayer) {
            this.detachChild(this.singleplayerGameMenu);
        } else {
            this.detachChild(this.multiplayerGameMenu);
        }
        if (callEvent) {
            EventHandler.callEvent(EventHandler.Event.GAMEMENU_CLOSE);
        }

        this.gameMenuEnabled = false;
    }

    private openGameMenu() {
        if (this.isSingleplayer) {
            this.attachChild(this.singleplayerGameMenu);
        } else {
            this.attachChild(this.multiplayerGameMenu);
        }
        EventHandler.callEvent(EventHandler.Event.GAMEMENU_OPEN);

        this.gameMenuEnabled = true;
    }
}
