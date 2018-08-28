import Component from '../../Component';
import EventHandler from '../../EventHandler';
import BlockCreationTool from './BlockCreationTool';
import GameSpawnCreationTool from './GameSpawnCreationTool';
import InitialSpawnCreationTool from './InitialSpawnCreationTool';

export default class CreationToolHandler extends Component{

    constructor(){
        super();
        this.blockCreationTool = new BlockCreationTool();
        this.gameSpawnCreationTool = new GameSpawnCreationTool();
        this.initialSpawnCreationTool = new InitialSpawnCreationTool(); 
        this.mode = Mode.CAMERA;
    }

    enable = () => {
        EventHandler.addListener(EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.addListener(EventHandler.Event.GAMEMENU_CLOSE_REQUEST, this.onGameMenuClose);

        EventHandler.addListener(EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_BLOCK, this.handleToggleToBlock);
        EventHandler.addListener(EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_CAMERA, this.handleToggleToCamera);
        EventHandler.addListener(EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_GAMESPAWN, this.handleToggleToGameSpawn);
        EventHandler.addListener(EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_INITIALSPAWN, this.handleToggleToInitialSpawn);
    };

    disable = () => {
        EventHandler.removeListener(EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.removeListener(EventHandler.Event.GAMEMENU_CLOSE_REQUEST, this.onGameMenuClose);

        EventHandler.removeListener(EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_BLOCK, this.handleToggleToBlock);
        EventHandler.removeListener(EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_CAMERA, this.handleToggleToCamera);
        EventHandler.removeListener(EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_GAMESPAWN, this.handleToggleToGameSpawn);
        EventHandler.removeListener(EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_INITIALSPAWN, this.handleToggleToInitialSpawn);
    };

    onGameMenuOpen = () => {
        if(this.mode === Mode.BLOCK){
            this.detachChild(this.blockCreationTool);
        }
    };

    onGameMenuClose = () => {
        if(this.mode === Mode.BLOCK){
            this.attachChild(this.blockCreationTool);
        }
    };

    handleToggleToCamera = () => {
        this.removeTool();
        this.mode = Mode.CAMERA;
    };

    handleToggleToBlock = () => {
        this.removeTool();
        this.attachChild(this.blockCreationTool);
        this.mode = Mode.BLOCK;
    };

    handleToggleToGameSpawn = () => {
        this.removeTool();
        this.attachChild(this.gameSpawnCreationTool);
        this.mode = Mode.GAMESPAWN;
    };

    handleToggleToInitialSpawn = () => {
        this.removeTool();
        this.attachChild(this.initialSpawnCreationTool);
        this.mode = Mode.INITIALSPAWN;
    };

    removeTool = () => {
        switch(this.mode){
            case Mode.BLOCK:
                this.detachChild(this.blockCreationTool);
                break;
            case Mode.GAMESPAWN:
                this.detachChild(this.gameSpawnCreationTool);
                break;
            case Mode.INITIALSPAWN:
                this.detachChild(this.initialSpawnCreationTool);
                break;
        }
    }
}

const Mode = {
    CAMERA: 0,
    BLOCK: 1,
    GAMESPAWN: 2,
    INITIALSPAWN: 3
}