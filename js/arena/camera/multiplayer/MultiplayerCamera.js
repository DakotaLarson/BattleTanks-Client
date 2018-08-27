import Component from '../../../Component';
import EventHandler from '../../../EventHandler';
import DomHandler from '../../../DomHandler';
import MultiplayerControls from './MultiplayerControls';

export default class Camera extends Component{

    constructor(camera){
        super();
        this.camera = camera;

        this.controls = new MultiplayerControls(camera);
    }

    enable = () => {
        EventHandler.addMonitorListener(EventHandler.Event.DOM_RESIZE, this.onResize);
        EventHandler.addListener(EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.addListener(EventHandler.Event.GAMEMENU_CLOSE_REQUEST, this.onGameMenuClose);

        this.attachControls();
    };

    disable = () => {
        EventHandler.removeListener(EventHandler.Event.DOM_RESIZE, this.onResize);
        EventHandler.removeListener(EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.removeListener(EventHandler.Event.GAMEMENU_CLOSE_REQUEST, this.onGameMenuClose);

        this.detachControls();
    };

    onResize = () => {
        let dimensions = DomHandler.getDisplayDimensions();
        this.camera.aspect = dimensions.width / dimensions.height;
        this.camera.updateProjectionMatrix();
    };

    onGameMenuOpen = () => {
        this.detachControls();
    };

    onGameMenuClose = () => {
        this.attachControls();
    };

    attachControls = () => {
        this.attachChild(this.controls);
    };

    detachControls = () => {
        this.detachChild(this.controls);
    };
}
