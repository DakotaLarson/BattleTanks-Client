import Component from 'Component';
import EventHandler from 'EventHandler';
import DomHandler from 'DomHandler';
import PlayerControls from 'PlayerControls';
import BuilderControls from 'BuilderControls';

export default class Camera extends Component{

    constructor(camera, scene){
        super();
        this.camera = camera;
        this.state.controls = 'builder';
        this.state.bctEnabled = false;

        this.playerControls = new PlayerControls(scene.getScene(), this.getCamera());
        this.builderControls = new BuilderControls(this.getCamera(), scene);
    }

    enable = () => {
        EventHandler.addMonitorEventListener(EventHandler.Event.DOM_RESIZE, this.onResize);
        EventHandler.addEventListener(EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.addEventListener(EventHandler.Event.GAMEMENU_CLOSE_REQUEST, this.onGameMenuClose);
        // EventHandler.addEventListener(EventHandler.Event.CONTROLS_TOGGLE_BUILDER, this.onToggleBuilder);
        // EventHandler.addEventListener(EventHandler.Event.CONTROLS_TOGGLE_PLAYER, this.onTogglePlayer);
        EventHandler.addEventListener(EventHandler.Event.CREATE_WORLD_MODE_TOGGLE_BLOCK, this.handleToggleToBlock);
        EventHandler.addEventListener(EventHandler.Event.CREATE_WORLD_MODE_TOGGLE_CAMERA, this.handleToggleToCamera);

        this.attachControls();
    };

    disable = () => {
        EventHandler.removeEventListener(EventHandler.Event.DOM_RESIZE, this.onResize);
        EventHandler.removeEventListener(EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.removeEventListener(EventHandler.Event.GAMEMENU_CLOSE_REQUEST, this.onGameMenuClose);
        EventHandler.removeEventListener(EventHandler.Event.CREATE_WORLD_MODE_TOGGLE_BLOCK, this.handleToggleToBlock);
        EventHandler.removeEventListener(EventHandler.Event.CREATE_WORLD_MODE_TOGGLE_CAMERA, this.handleToggleToCamera);

        this.detachControls();
    };

    onResize = () => {
        let dimensions = DomHandler.getDisplayDimensions();
        this.camera.aspect = dimensions.width / dimensions.height;
        this.camera.updateProjectionMatrix();
    };

    getCamera = () => {
        return this.camera;
    };

    onGameMenuOpen = () => {
        if(!this.state.bctEnabled){
            this.detachControls();
        }
    };

    onGameMenuClose = () => {
        if(!this.state.bctEnabled){
            this.attachControls();
        }
    };

    onToggleBuilder = () => {
        this.detachControls();
        this.state.controls = 'builder';
        this.attachControls();
    };

    onTogglePlayer = () => {
        this.detachControls();
        this.state.controls = 'player';
        this.attachControls();
    };

    attachControls = () => {
        if(this.state.controls === 'player'){
            this.camera.position.set(0, 0, 0);
            this.camera.rotation.set(0, 0, 0);
            this.attachChild(this.playerControls);
        }else if(this.state.controls === 'builder'){
            this.attachChild(this.builderControls);
        }
    };

    detachControls = () => {
        if(this.state.controls === 'player'){
            this.detachChild(this.playerControls);
        }else if(this.state.controls === 'builder'){
            this.detachChild(this.builderControls);
        }
    };

    handleToggleToCamera = () => {
        this.state.bctEnabled = true;
        this.attachControls();
    };

    handleToggleToBlock = () => {
        this.state.bctEnabled = true;
        this.detachControls();
    };
}
