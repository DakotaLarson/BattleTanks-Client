import Component from '../../../Component';
import EventHandler from '../../../EventHandler';
import DomHandler from '../../../DomHandler';
import SinglePlayerControls from './SinglePlayerControls';

export default class Camera extends Component{

    constructor(camera){
        super();
        this.camera = camera;
        this.controlsEnabled = true;

        this.controls = new SinglePlayerControls(camera);
    }

    enable = () => {
        EventHandler.addMonitorListener(EventHandler.Event.DOM_RESIZE, this.onResize);
        EventHandler.addListener(EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.addListener(EventHandler.Event.GAMEMENU_CLOSE_REQUEST, this.onGameMenuClose);
        EventHandler.addListener(EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_BLOCK, this.handleToggleToBlock);
        EventHandler.addListener(EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_CAMERA, this.handleToggleToCamera);

        this.attachControls(true);
    };

    disable = () => {
        EventHandler.removeListener(EventHandler.Event.DOM_RESIZE, this.onResize);
        EventHandler.removeListener(EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.removeListener(EventHandler.Event.GAMEMENU_CLOSE_REQUEST, this.onGameMenuClose);
        EventHandler.removeListener(EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_BLOCK, this.handleToggleToBlock);
        EventHandler.removeListener(EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_CAMERA, this.handleToggleToCamera);

        this.detachControls(true);
    };

    onResize = () => {
        let dimensions = DomHandler.getDisplayDimensions();
        this.camera.aspect = dimensions.width / dimensions.height;
        this.camera.updateProjectionMatrix();
    };

    onGameMenuOpen = () => {
        if(this.controlsEnabled){
            this.detachControls(false);
        }
    };

    onGameMenuClose = () => {
        if(this.controlsEnabled){
            this.attachControls(false);
        }
    };

    attachControls = (updateStatus) => {
        this.attachChild(this.controls);
        if(updateStatus){
            this.controlsEnabled = true;
        }
    };

    detachControls = (updateStatus) => {
        this.detachChild(this.controls);
        if(updateStatus){
            this.controlsEnabled = false;
        }
    };

    handleToggleToCamera = () => {
        this.attachControls(true);
    };

    handleToggleToBlock = () => {
        this.detachControls(true);
    };
}
