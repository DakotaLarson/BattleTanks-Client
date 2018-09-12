import {PerspectiveCamera} from 'three';

import EventHandler from '../EventHandler';
import Component from '../Component';
import SingleplayerArena from './arena/SinglePlayerArena';
import MultiplayerArena from './arena/MultiplayerArena';
import SingleplayerGUI from '../gui/SingleplayerGUI';
import MultiplayerGUI from '../gui/MultiplayerGUI';
import SingleplayerGameMenu from '../game_menu/SingleplayerGameMenu';
import MultiplayerGameMenu from '../game_menu/MultiplayerGameMenu';
import CreationToolHandler from './tools/CreationToolHandler';
import SingleplayerCamera from './camera/singleplayer/SingleplayerCamera';
import MultiplayerCamera from './camera/multiplayer/MultiplayerCamera';
import Renderer from '../Renderer';
import SceneHandler from './SceneHandler';
import RaycastHandler from '../RaycastHandler';


export default class ArenaHandler extends Component{

    sceneHandler: SceneHandler;
    renderer: Renderer;

    singleplayerArena: SingleplayerArena;
    multiplayerArena: MultiplayerArena;

    creationToolHandler: CreationToolHandler;

    singleplayerGUI: SingleplayerGUI;
    multiplayerGUI: MultiplayerGUI;

    singleplayerGameMenu: SingleplayerGameMenu;
    multiplayerGameMenu: MultiplayerGameMenu;

    singleplayerCamera: SingleplayerCamera;
    multiplayerCamera: MultiplayerCamera;

    isSingleplayer: boolean;
    gameMenuEnabled: boolean;

    constructor(){
        super();

        let perspectiveCamera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);

        RaycastHandler.init();
        RaycastHandler.updateCamera(perspectiveCamera);

        this.sceneHandler = new SceneHandler();
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

        this.isSingleplayer = false;
        this.gameMenuEnabled = false;
    }

    enable(){
        EventHandler.addListener(this, EventHandler.Event.CREATEWORLDMENU_CREATE_OPT_CLICK, this.attachSingleplayerArena);
        EventHandler.addListener(this, EventHandler.Event.LOADWORLDMENU_LOAD_OPT_CLICK, this.attachSingleplayerArena);

        EventHandler.addListener(this, EventHandler.Event.SP_GAMEMENU_RETURN_TO_MAIN_REQUEST, this.detachSingleplayerArena);

        EventHandler.addListener(this, EventHandler.Event.CONNECTMENU_CONNECT_OPT_CLICK, this.attachMultiplayerArena);

        EventHandler.addListener(this, EventHandler.Event.CONNECTION_SCREEN_DISCONNECT, this.detachMultiplayerArena);
        EventHandler.addListener(this, EventHandler.Event.MP_GAMEMENU_DISCONNECT, this.detachMultiplayerArena);
        EventHandler.addListener(this, EventHandler.Event.MULTIPLAYER_CONNECTION_WS_CLOSE, this.detachMultiplayerArena);
    }

    disable(){
        EventHandler.removeListener(this, EventHandler.Event.CREATEWORLDMENU_CREATE_OPT_CLICK, this.attachSingleplayerArena);
        EventHandler.removeListener(this, EventHandler.Event.LOADWORLDMENU_LOAD_OPT_CLICK, this.attachSingleplayerArena);

        EventHandler.removeListener(this, EventHandler.Event.SP_GAMEMENU_RETURN_TO_MAIN_REQUEST, this.detachSingleplayerArena);

        EventHandler.removeListener(this, EventHandler.Event.CONNECTMENU_CONNECT_OPT_CLICK, this.attachMultiplayerArena);

        EventHandler.removeListener(this, EventHandler.Event.CONNECTION_SCREEN_DISCONNECT, this.detachMultiplayerArena);
        EventHandler.removeListener(this, EventHandler.Event.MP_GAMEMENU_DISCONNECT, this.detachMultiplayerArena);
        EventHandler.removeListener(this, EventHandler.Event.MULTIPLAYER_CONNECTION_WS_CLOSE, this.detachMultiplayerArena);
    }

    attachSingleplayerArena(worldData){
        this.attachArena();

        this.attachChild(this.singleplayerArena);
        this.attachChild(this.singleplayerGUI);
        this.attachChild(this.creationToolHandler);
        this.attachChild(this.singleplayerCamera);

        EventHandler.callEvent(EventHandler.Event.ARENA_SCENE_UPDATE, worldData);

        this.isSingleplayer = true;
    }

    detachSingleplayerArena(){
        this.detachArena();

        this.detachChild(this.singleplayerArena);
        this.detachChild(this.singleplayerGUI);
        this.detachChild(this.creationToolHandler);
        this.detachChild(this.singleplayerCamera);
    }

    attachMultiplayerArena(){
        this.attachArena();

        this.attachChild(this.multiplayerArena);
        this.attachChild(this.multiplayerGUI);
        this.attachChild(this.multiplayerCamera);

        this.isSingleplayer = false;
    }

    detachMultiplayerArena(){
        this.detachArena();

        this.detachChild(this.multiplayerArena);
        this.detachChild(this.multiplayerGUI);
        this.detachChild(this.multiplayerCamera);
    }

    attachArena(){
        EventHandler.addListener(this, EventHandler.Event.DOM_KEYDOWN, this.onKeyDown);
        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_CLOSE_REQUEST, this.closeGameMenu);
        EventHandler.addListener(this, EventHandler.Event.DOM_BLUR, this.onBlur);

        this.attachChild(this.sceneHandler);
        this.attachChild(this.renderer);
    }

    detachArena(){
        EventHandler.removeListener(this, EventHandler.Event.DOM_KEYDOWN, this.onKeyDown);
        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_CLOSE_REQUEST, this.closeGameMenu);
        EventHandler.removeListener(this, EventHandler.Event.DOM_BLUR, this.onBlur);

        this.detachChild(this.sceneHandler);
        this.detachChild(this.renderer);
        
        if(this.gameMenuEnabled){
            this.closeGameMenu();
        }
    }

    onKeyDown(event: KeyboardEvent){
        if(event.code === 'Escape') {
            if(this.gameMenuEnabled){
                this.closeGameMenu();
            }else{
                this.openGameMenu();
            }
        }
    }

    onBlur(){
        if(!this.gameMenuEnabled){
            this.openGameMenu();
        }
    }

    closeGameMenu(){
        if(this.isSingleplayer){
            this.detachChild(this.singleplayerGameMenu);
        }else{
            this.detachChild(this.multiplayerGameMenu);
        }
        EventHandler.callEvent(EventHandler.Event.GAMEMENU_CLOSE);

        this.gameMenuEnabled = false;
    }

    openGameMenu(){
        if(this.isSingleplayer){
            this.attachChild(this.singleplayerGameMenu);
        }else{
            this.attachChild(this.multiplayerGameMenu);
        }
        EventHandler.callEvent(EventHandler.Event.GAMEMENU_OPEN);

        this.gameMenuEnabled = true;
    }
}