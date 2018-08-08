import Component from 'Component';
import EventHandler from 'EventHandler';
import BlockCreationTool from 'BlockCreationTool';

export default class CreationToolHandler extends Component{

    constructor(camera, floor){
        super();
        this.blockCreationTool = new BlockCreationTool(camera, floor);
        this.bctEnabled = false;
    }

    enable = () => {
        EventHandler.addListener(EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.addListener(EventHandler.Event.GAMEMENU_CLOSE_REQUEST, this.onGameMenuClose);

        EventHandler.addListener(EventHandler.Event.CREATE_WORLD_MODE_TOGGLE_BLOCK, this.handleToggleToBlock);
        EventHandler.addListener(EventHandler.Event.CREATE_WORLD_MODE_TOGGLE_CAMERA, this.handleToggleToCamera);
    };

    disable = () => {
        EventHandler.removeListener(EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.removeListener(EventHandler.Event.GAMEMENU_CLOSE_REQUEST, this.onGameMenuClose);

        EventHandler.removeListener(EventHandler.Event.CREATE_WORLD_MODE_TOGGLE_BLOCK, this.handleToggleToBlock);
        EventHandler.removeListener(EventHandler.Event.CREATE_WORLD_MODE_TOGGLE_CAMERA, this.handleToggleToCamera);
    };

    onGameMenuOpen = () => {
        if(this.bctEnabled){
            this.detachChild(this.blockCreationTool);
        }
    };

    onGameMenuClose = () => {
        if(this.bctEnabled){
            this.attachChild(this.blockCreationTool);
        }
    };

    handleToggleToCamera = () => {
        this.detachChild(this.blockCreationTool);
        this.bctEnabled = false;
    };

    handleToggleToBlock = () => {
        this.attachChild(this.blockCreationTool);
        this.bctEnabled = true;
    };

}
