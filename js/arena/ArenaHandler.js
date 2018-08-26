import EventHandler from '../EventHandler';
import Component from '../Component';
import Arena from './Arena';
import SingleplayerGUI from '../gui/SingleplayerGUI';
import MultiplayerGUI from '../gui/MultiplayerGUI';
import SingleplayerGameMenu from '../game_menu/SingleplayerGameMenu';
import MultiplayerGameMenu from '../game_menu/MultiplayerGameMenu';
import CreationToolHandler from './tools/CreationToolHandler';


export default class ArenaHandler extends Component{

    constructor(){
        super();

        this.arena = new Arena();
        this.creationToolHandler = new CreationToolHandler();

        this.singleplayerGUI = new SingleplayerGUI();
        this.multiplayerGUI = new MultiplayerGUI();

        this.singleplayerGameMenu = new SingleplayerGameMenu();
        this.multiplayerGameMenu = new MultiplayerGameMenu();

        this.isSingleplayer = false;
        this.gameMenuEnabled = false;
    }

    enable = () => {
        EventHandler.addListener(EventHandler.Event.CREATEWORLDMENU_CREATE_OPT_CLICK, this.attachSingleplayerArena);
        EventHandler.addListener(EventHandler.Event.LOADWORLDMENU_LOAD_OPT_CLICK, this.attachSingleplayerArena);

        EventHandler.addListener(EventHandler.Event.SP_GAMEMENU_RETURN_TO_MAIN_REQUEST, this.detachSingleplayerArena);

        EventHandler.addListener(EventHandler.Event.MPMENU_CONNECT_OPT_CLICK, this.attachMultiplayerArena);

        EventHandler.addListener(EventHandler.Event.CONNECTION_SCREEN_CANCEL, this.detachMultiplayerArena);
        EventHandler.addListener(EventHandler.Event.MP_GAMEMENU_DISCONNECT, this.detachMultiplayerArena);
    };

    disable = () => {
        EventHandler.removeListener(EventHandler.Event.CREATEWORLDMENU_CREATE_OPT_CLICK, this.attachSingleplayerArena);
        EventHandler.removeListener(EventHandler.Event.LOADWORLDMENU_LOAD_OPT_CLICK, this.attachSingleplayerArena);

        EventHandler.removeListener(EventHandler.Event.SP_GAMEMENU_RETURN_TO_MAIN_REQUEST, this.detachSingleplayerArena);

        EventHandler.removeListener(EventHandler.Event.MPMENU_CONNECT_OPT_CLICK, this.attachMultiplayerArena);

        EventHandler.removeListener(EventHandler.Event.CONNECTION_SCREEN_CANCEL, this.detachMultiplayerArena);
        EventHandler.removeListener(EventHandler.Event.MP_GAMEMENU_DISCONNECT, this.detachMultiplayerArena);
    }

    attachSingleplayerArena = (worldData) => {
        this.attachArena();

        this.attachChild(this.singleplayerGUI);
        this.attachChild(this.creationToolHandler);

        EventHandler.callEvent(EventHandler.Event.ARENA_SCENE_UPDATE, worldData);

        this.isSingleplayer = true;
    };

    detachSingleplayerArena = () => {
        this.detachArena();

        this.detachChild(this.singleplayerGUI);
        this.detachChild(this.creationToolHandler);
    };

    attachMultiplayerArena = () => {
        this.attachArena();

        this.attachChild(this.multiplayerGUI);

        this.isSingleplayer = false;
    };

    detachMultiplayerArena = () => {
        this.detachArena();

        this.detachChild(this.multiplayerGUI);
    };

    attachArena = () => {
        EventHandler.addListener(EventHandler.Event.DOM_KEYDOWN, this.onKeyDown);
        EventHandler.addListener(EventHandler.Event.GAMEMENU_CLOSE_REQUEST, this.closeGameMenu);
        EventHandler.addListener(EventHandler.Event.DOM_BLUR, this.onBlur);
        this.attachChild(this.arena);
    };

    detachArena = () => {
        EventHandler.removeListener(EventHandler.Event.DOM_KEYDOWN, this.onKeyDown);
        EventHandler.removeListener(EventHandler.Event.GAMEMENU_CLOSE_REQUEST, this.closeGameMenu);
        EventHandler.removeListener(EventHandler.Event.DOM_BLUR, this.onBlur);
        this.detachChild(this.arena);
        
        if(this.gameMenuEnabled){
            this.closeGameMenu();
        }
    };

    onKeyDown = (event) => {
        if(event.code === 'Escape') {
            if(this.gameMenuEnabled){
                EventHandler.callEvent(EventHandler.Event.GAMEMENU_CLOSE_REQUEST);
            }else{
                this.openGameMenu();
            }
        }
    };

    onBlur = () => {
        if(!this.gameMenuEnabled){
            this.openGameMenu();
        }
    };

    closeGameMenu = () => {
        if(this.isSingleplayer){
            this.detachChild(this.singleplayerGameMenu);
        }else{
            this.detachChild(this.multiplayerGameMenu);
        }
        this.gameMenuEnabled = false;
    };

    openGameMenu = () => {
        if(this.isSingleplayer){
            this.attachChild(this.singleplayerGameMenu);
        }else{
            this.attachChild(this.multiplayerGameMenu);
        }        
        this.gameMenuEnabled = true;
    };
}