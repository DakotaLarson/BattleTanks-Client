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
import MultiplayerCamera from "./camera/MultiplayerCamera";
import SingleplayerCamera from "./camera/SingleplayerCamera";
import PowerupCollisionHandler from "./powerup/PowerupCollisionHandler";
import ProjectileHandler from "./ProjectileHandler";
import RecordingHandler from "./RecordingHandler";
import SceneHandler from "./scene/SceneHandler";
import TankCustomizationHandler from "./scene/TankCustomizationHandler";
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

    private tankCustomizationHandler: TankCustomizationHandler;

    private recordingHandler: RecordingHandler;

    private isSingleplayer: boolean;
    private arenaAttached: boolean;

    constructor(perspectiveCamera: PerspectiveCamera, useMP3: boolean, recordingGainNode: GainNode) {
        super();

        Globals.setGlobal(Globals.Global.CAMERA, perspectiveCamera);

        const audioListener = new AudioListener();
        const recordingAudioListener = new AudioListener();
        recordingAudioListener.gain.disconnect(recordingAudioListener.context.destination);

        perspectiveCamera.add(audioListener);
        perspectiveCamera.add(recordingAudioListener);

        RaycastHandler.init();

        this.sceneHandler = new SceneHandler(audioListener, recordingAudioListener, useMP3);
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

        this.audioHandler = new AudioHandler(audioListener, recordingAudioListener);
        this.projectileHandler = new ProjectileHandler(this.sceneHandler.getScene());
        this.powerupCollisionHandler = new PowerupCollisionHandler();
        this.arenaDownloadHandler = new ArenaDownloadHandler();

        this.tankCustomizationHandler = new TankCustomizationHandler();

        this.recordingHandler = new RecordingHandler(recordingAudioListener, recordingGainNode);

        this.isSingleplayer = false;
        this.arenaAttached = false;

        Globals.setGlobal(Globals.Global.GAME_MENU_OPEN, false);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.CREATEWORLDMENU_CREATE_OPT_CLICK, this.attachSingleplayerArena);
        EventHandler.addListener(this, EventHandler.Event.LOADWORLDMENU_LOAD_OPT_CLICK, this.attachSingleplayerArena);

        EventHandler.addListener(this, EventHandler.Event.SP_GAMEMENU_RETURN_TO_MAIN_REQUEST, this.detachSingleplayerArena);

        EventHandler.addListener(this, EventHandler.Event.MULTIPLAYER_CONNECT_REQUEST, this.attachMultiplayerArena);

        EventHandler.addListener(this, EventHandler.Event.MULTIPLAYER_DISCONNECT_REQUEST, this.detachMultiplayerArena);
        EventHandler.addListener(this, EventHandler.Event.MULTIPLAYER_CONNECTION_WS_CLOSE, this.detachMultiplayerArena);

        EventHandler.addListener(this, EventHandler.Event.OVERLAY_OPEN, this.onOverlayOpen);
        EventHandler.addListener(this, EventHandler.Event.RECORDING_REQUEST, this.onRecordingRequest);

        this.attachComponent(this.audioHandler);
        this.attachComponent(this.renderer);

        this.attachComponent(this.sceneHandler);

        this.attachComponent(this.tankCustomizationHandler);

        this.sceneHandler.renderMenu();
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
        this.attachChild(this.recordingHandler);

        this.isSingleplayer = false;
    }

    private detachMultiplayerArena() {
        this.detachArena();

        this.detachChild(this.multiplayerArena);
        this.detachChild(this.multiplayerGUI);
        this.detachChild(this.multiplayerCamera);
        this.detachChild(this.projectileHandler);
        this.detachChild(this.powerupCollisionHandler);
        this.detachChild(this.recordingHandler);
    }

    private attachArena() {
        EventHandler.addListener(this, EventHandler.Event.DOM_KEYUP, this.onKeyUp);
        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_CLOSE_REQUEST, this.closeGameMenuFromEvent);
        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_OPEN_REQUEST, this.onEscape);
        EventHandler.addListener(this, EventHandler.Event.DOM_BLUR, this.onBlur);
        EventHandler.addListener(this, EventHandler.Event.DOM_POINTERLOCK_DISABLE_INVOKED, this.onEscape);
        EventHandler.addListener(this, EventHandler.Event.DOM_POINTERLOCK_DISABLE, this.onEscape);
        EventHandler.addListener(this, EventHandler.Event.PROFILE_OPENED, this.onProfileOpened);

        this.sceneHandler.renderArena();
        this.arenaAttached = true;
    }

    private detachArena() {
        if (this.arenaAttached) {
            EventHandler.removeListener(this, EventHandler.Event.DOM_KEYUP, this.onKeyUp);
            EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_CLOSE_REQUEST, this.closeGameMenuFromEvent);
            EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_OPEN_REQUEST, this.onEscape);
            EventHandler.removeListener(this, EventHandler.Event.DOM_BLUR, this.onBlur);
            EventHandler.removeListener(this, EventHandler.Event.DOM_POINTERLOCK_DISABLE_INVOKED, this.onEscape);
            EventHandler.removeListener(this, EventHandler.Event.DOM_POINTERLOCK_DISABLE, this.onEscape);
            EventHandler.removeListener(this, EventHandler.Event.PROFILE_OPENED, this.onProfileOpened);

            this.sceneHandler.renderMenu();

            if (this.isGameMenuOpen()) {
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
        if (this.arenaAttached) {
            if (!this.isChatOpen() && !this.isOptionsOpen()) {
                if (this.isGameMenuOpen()) {
                    this.closeGameMenu(true);
                } else {
                    this.openGameMenu();
                }
            }
        }
    }

    private onOverlayOpen() {
        if (this.arenaAttached) {
            if (!this.isGameMenuOpen()) {
                this.openGameMenu();
            }
        }
    }

    private onBlur() {
        if (this.arenaAttached) {
            if (!this.isGameMenuOpen()) {
                this.openGameMenu();
            }
        }
    }

    private onProfileOpened() {
        if (this.arenaAttached) {
            if (!this.isGameMenuOpen()) {
                this.openGameMenu();
            }
        }
    }

    private onRecordingRequest() {
        this.recordingHandler.allowRecording();
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

    private isGameMenuOpen() {
        return Globals.getGlobal(Globals.Global.GAME_MENU_OPEN);
    }

    private isChatOpen() {
        return Globals.getGlobal(Globals.Global.CHAT_OPEN);
    }

    private isOptionsOpen() {
        return Globals.getGlobal(Globals.Global.OPTIONS_OPEN);
    }
}
