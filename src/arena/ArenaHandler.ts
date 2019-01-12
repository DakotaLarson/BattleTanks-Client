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
import ArenaDownloadHandler from "./ArenaDownloadHandler";
import MultiplayerCamera from "./camera/multiplayer/MultiplayerCamera";
import SingleplayerCamera from "./camera/singleplayer/SingleplayerCamera";
import PowerupCollisionHandler from "./powerup/PowerupCollisionHandler";
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
    private powerupCollisionHandler: PowerupCollisionHandler;
    private arenaDownloadHandler: ArenaDownloadHandler;

    private isSingleplayer: boolean;
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
        this.powerupCollisionHandler = new PowerupCollisionHandler();
        this.arenaDownloadHandler = new ArenaDownloadHandler();

        this.isSingleplayer = false;
        this.arenaAttached = false;

        Globals.setGlobal(Globals.Global.GAME_MENU_OPEN, false);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.CREATEWORLDMENU_CREATE_OPT_CLICK, this.attachSingleplayerArena);
        EventHandler.addListener(this, EventHandler.Event.LOADWORLDMENU_LOAD_OPT_CLICK, this.attachSingleplayerArena);

        EventHandler.addListener(this, EventHandler.Event.SP_GAMEMENU_RETURN_TO_MAIN_REQUEST, this.detachSingleplayerArena);

        EventHandler.addListener(this, EventHandler.Event.MPMENU_JOIN_OPT_CLICK, this.attachMultiplayerArena);

        EventHandler.addListener(this, EventHandler.Event.CONNECTION_SCREEN_DISCONNECT, this.detachMultiplayerArena);
        EventHandler.addListener(this, EventHandler.Event.MP_GAMEMENU_DISCONNECT, this.detachMultiplayerArena);
        EventHandler.addListener(this, EventHandler.Event.MULTIPLAYER_CONNECTION_WS_CLOSE, this.detachMultiplayerArena);

        EventHandler.addListener(this, EventHandler.Event.OPTIONS_OPEN, this.onOptionsOpen);

        this.attachComponent(this.audioHandler);
    }

    private attachSingleplayerArena(worldData: any) {
        this.attachArena();

        this.attachChild(this.singleplayerArena);
        this.attachChild(this.singleplayerGUI);
        this.attachChild(this.creationToolHandler);
        this.attachChild(this.singleplayerCamera);
        this.attachChild(this.arenaDownloadHandler);

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
        this.detachChild(this.arenaDownloadHandler);
    }

    private attachMultiplayerArena() {
        this.attachArena();

        this.attachChild(this.multiplayerArena);
        this.attachChild(this.multiplayerGUI);
        this.attachChild(this.multiplayerCamera);
        this.attachChild(this.projectileHandler);
        this.attachChild(this.powerupCollisionHandler);

        this.isSingleplayer = false;
    }

    private detachMultiplayerArena() {
        this.detachArena();

        this.detachChild(this.multiplayerArena);
        this.detachChild(this.multiplayerGUI);
        this.detachChild(this.multiplayerCamera);
        this.detachChild(this.projectileHandler);
        this.detachChild(this.powerupCollisionHandler);
    }

    private attachArena() {
        EventHandler.addListener(this, EventHandler.Event.DOM_KEYUP, this.onKeyUp);
        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_CLOSE_REQUEST, this.closeGameMenuFromEvent);
        EventHandler.addListener(this, EventHandler.Event.DOM_BLUR, this.onBlur);
        EventHandler.addListener(this, EventHandler.Event.DOM_POINTERLOCK_DISABLE_INVOKED, this.onEscape);
        EventHandler.addListener(this, EventHandler.Event.DOM_POINTERLOCK_DISABLE, this.onEscape);

        this.attachChild(this.sceneHandler);
        this.attachChild(this.renderer);
        this.arenaAttached = true;
    }

    private detachArena() {
        if (this.arenaAttached) {
            EventHandler.removeListener(this, EventHandler.Event.DOM_KEYUP, this.onKeyUp);
            EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_CLOSE_REQUEST, this.closeGameMenuFromEvent);
            EventHandler.removeListener(this, EventHandler.Event.DOM_BLUR, this.onBlur);
            EventHandler.removeListener(this, EventHandler.Event.DOM_POINTERLOCK_DISABLE_INVOKED, this.onEscape);
            EventHandler.removeListener(this, EventHandler.Event.DOM_POINTERLOCK_DISABLE, this.onEscape);

            this.detachChild(this.sceneHandler);
            this.detachChild(this.renderer);

            if (Globals.getGlobal(Globals.Global.GAME_MENU_OPEN)) {
                this.closeGameMenu(false);
            }

            this.arenaAttached = false;
        }
    }

    private onKeyUp(event: KeyboardEvent) {
        if (event.code === "Escape") {
            this.onEscape();
        }
    }

    private onEscape() {
        if (!Globals.getGlobal(Globals.Global.CHAT_OPEN) && !Globals.getGlobal(Globals.Global.OPTIONS_OPEN)) {
            if (Globals.getGlobal(Globals.Global.GAME_MENU_OPEN)) {
                this.closeGameMenu(true);
            } else {
                this.openGameMenu();
            }
        }
    }

    private onOptionsOpen() {
        if (!Globals.getGlobal(Globals.Global.GAME_MENU_OPEN)) {
            this.openGameMenu();
        }
    }

    private onBlur() {
        if (!Globals.getGlobal(Globals.Global.GAME_MENU_OPEN)) {
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
        Globals.setGlobal(Globals.Global.GAME_MENU_OPEN, false);
        if (callEvent) {
            EventHandler.callEvent(EventHandler.Event.GAMEMENU_CLOSE);
        }
    }

    private openGameMenu() {
        if (this.isSingleplayer) {
            this.attachChild(this.singleplayerGameMenu);
        } else {
            this.attachChild(this.multiplayerGameMenu);
        }
        Globals.setGlobal(Globals.Global.GAME_MENU_OPEN, true);

        EventHandler.callEvent(EventHandler.Event.GAMEMENU_OPEN);
    }
}
