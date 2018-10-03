import { PerspectiveCamera } from "three";
import Component from "../../../component/ChildComponent";
import DomHandler from "../../../DomHandler";
import EventHandler from "../../../EventHandler";
import CameraControls from "../CameraControls";

export default class Camera extends Component {

    private camera: PerspectiveCamera;
    private controlsEnabled: boolean;
    private controls: CameraControls;

    constructor(camera: PerspectiveCamera) {
        super();
        this.camera = camera;
        this.controlsEnabled = true;

        this.controls = new CameraControls(camera, false, true);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_RESIZE, this.onResize, EventHandler.Level.LOW);

        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_CLOSE, this.onGameMenuClose);

        EventHandler.addListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_BLOCK, this.onToggleToOther);
        EventHandler.addListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_GAMESPAWN, this.onToggleToOther);
        EventHandler.addListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_INITIALSPAWN, this.onToggleToOther);

        EventHandler.addListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_CAMERA, this.onToggleToCamera);

        this.attachControls(true);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_RESIZE, this.onResize, EventHandler.Level.LOW);

        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_CLOSE, this.onGameMenuClose);

        EventHandler.removeListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_BLOCK, this.onToggleToOther);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_GAMESPAWN, this.onToggleToOther);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_INITIALSPAWN, this.onToggleToOther);

        EventHandler.removeListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_CAMERA, this.onToggleToCamera);

        this.detachControls(true);
    }

    private onResize() {
        const dimensions = DomHandler.getDisplayDimensions();
        this.camera.aspect = dimensions.width / dimensions.height;
        this.camera.updateProjectionMatrix();
    }

    private onGameMenuOpen() {
        if (this.controlsEnabled) {
            this.detachControls(false);
        }
    }

    private onGameMenuClose() {
        if (this.controlsEnabled) {
            this.attachControls(false);
        }
    }

    private attachControls(updateStatus: boolean) {
        this.attachChild(this.controls);
        if (updateStatus) {
            this.controlsEnabled = true;
        }
    }

    private detachControls(updateStatus: boolean) {
        this.detachChild(this.controls);
        if (updateStatus) {
            this.controlsEnabled = false;
        }
    }

    private onToggleToCamera() {
        this.attachControls(true);
    }

    private onToggleToOther() {
        this.detachControls(true);
    }
}
