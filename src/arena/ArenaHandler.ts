import {AudioListener, PerspectiveCamera} from "three";

import AudioHandler from "../audio/AudioHandler";
import Component from "../component/Component";
import EventHandler from "../EventHandler";
import MultiplayerGameMenu from "../game_menu/MultiplayerGameMenu";
import SingleplayerGameMenu from "../game_menu/SingleplayerGameMenu";
import MultiplayerGUI from "../gui/MultiplayerGUI";
import SingleplayerGUI from "../gui/SingleplayerGUI";
import RaycastHandler from "../RaycastHandler";
import Renderer from "../Renderer";
import MultiplayerArena from "./arena/MultiplayerArena";
import SingleplayerArena from "./arena/SinglePlayerArena";
import MultiplayerCamera from "./camera/multiplayer/MultiplayerCamera";
import SingleplayerCamera from "./camera/singleplayer/SingleplayerCamera";
import SceneHandler from "./scene/SceneHandler";
import CreationToolHandler from "./tools/CreationToolHandler";

export default class ArenaHandler extends Component {

    public sceneHandler: SceneHandler;
    public renderer: Renderer;

    public singleplayerArena: SingleplayerArena;
    public multiplayerArena: MultiplayerArena;

    public creationToolHandler: CreationToolHandler;

    public singleplayerGUI: SingleplayerGUI;
    public multiplayerGUI: MultiplayerGUI;

    public singleplayerGameMenu: SingleplayerGameMenu;
    public multiplayerGameMenu: MultiplayerGameMenu;

    public singleplayerCamera: SingleplayerCamera;
    public multiplayerCamera: MultiplayerCamera;

    public audioHandler: AudioHandler;

    public isSingleplayer: boolean;
    public gameMenuEnabled: boolean;

    constructor() {
        super();

        const perspectiveCamera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        const audioListener = new AudioListener();
        perspectiveCamera.add(audioListener);

        RaycastHandler.init();
        RaycastHandler.updateCamera(perspectiveCamera);

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

        this.audioHandler = new AudioHandler(perspectiveCamera, audioListener);

        this.isSingleplayer = false;
        this.gameMenuEnabled = false;
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.CREATEWORLDMENU_CREATE_OPT_CLICK, this.attachSingleplayerArena);
        EventHandler.addListener(this, EventHandler.Event.LOADWORLDMENU_LOAD_OPT_CLICK, this.attachSingleplayerArena);

        EventHandler.addListener(this, EventHandler.Event.SP_GAMEMENU_RETURN_TO_MAIN_REQUEST, this.detachSingleplayerArena);

        EventHandler.addListener(this, EventHandler.Event.MPMENU_JOIN_OPT_CLICK, this.attachMultiplayerArena);

        EventHandler.addListener(this, EventHandler.Event.CONNECTION_SCREEN_DISCONNECT, this.detachMultiplayerArena);
        EventHandler.addListener(this, EventHandler.Event.MP_GAMEMENU_DISCONNECT, this.detachMultiplayerArena);
        EventHandler.addListener(this, EventHandler.Event.MULTIPLAYER_CONNECTION_WS_CLOSE, this.detachMultiplayerArena);
    }

    public attachSingleplayerArena(worldData: any) {
        this.attachArena();

        this.attachChild(this.singleplayerArena);
        this.attachChild(this.singleplayerGUI);
        this.attachChild(this.creationToolHandler);
        this.attachChild(this.singleplayerCamera);

        worldData.fromServer = false;
        EventHandler.callEvent(EventHandler.Event.ARENA_SCENE_UPDATE, worldData);

        this.isSingleplayer = true;
    }

    public detachSingleplayerArena() {
        this.detachArena();

        this.detachChild(this.singleplayerArena);
        this.detachChild(this.singleplayerGUI);
        this.detachChild(this.creationToolHandler);
        this.detachChild(this.singleplayerCamera);
    }

    public attachMultiplayerArena() {
        this.attachArena();

        this.attachChild(this.multiplayerArena);
        this.attachChild(this.multiplayerGUI);
        this.attachChild(this.multiplayerCamera);
        this.attachChild(this.audioHandler);

        this.isSingleplayer = false;
    }

    public detachMultiplayerArena() {
        this.detachArena();

        this.detachChild(this.multiplayerArena);
        this.detachChild(this.multiplayerGUI);
        this.detachChild(this.multiplayerCamera);
        this.detachChild(this.audioHandler);
    }

    public attachArena() {
        EventHandler.addListener(this, EventHandler.Event.DOM_KEYDOWN, this.onKeyDown);
        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_CLOSE_REQUEST, this.closeGameMenuFromEvent);
        EventHandler.addListener(this, EventHandler.Event.DOM_BLUR, this.onBlur);

        this.attachChild(this.sceneHandler);
        this.attachChild(this.renderer);
    }

    public detachArena() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_KEYDOWN, this.onKeyDown);
        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_CLOSE_REQUEST, this.closeGameMenuFromEvent);
        EventHandler.removeListener(this, EventHandler.Event.DOM_BLUR, this.onBlur);

        this.detachChild(this.sceneHandler);
        this.detachChild(this.renderer);

        if (this.gameMenuEnabled) {
            this.closeGameMenu(false);
        }
    }

    public onKeyDown(event: KeyboardEvent) {
        if (event.code === "Escape") {
            if (this.gameMenuEnabled) {
                this.closeGameMenu(true);
            } else {
                this.openGameMenu();
            }
        }
    }

    public onBlur() {
        if (!this.gameMenuEnabled) {
            this.openGameMenu();
        }
    }

    public closeGameMenuFromEvent() {
        this.closeGameMenu(true);
    }

    public closeGameMenu(callEvent: boolean) {
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

    public openGameMenu() {
        if (this.isSingleplayer) {
            this.attachChild(this.singleplayerGameMenu);
        } else {
            this.attachChild(this.multiplayerGameMenu);
        }
        EventHandler.callEvent(EventHandler.Event.GAMEMENU_OPEN);

        this.gameMenuEnabled = true;
    }
}
