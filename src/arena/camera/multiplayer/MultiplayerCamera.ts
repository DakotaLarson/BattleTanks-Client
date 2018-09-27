import Component from "../../../component/ChildComponent";
import DomHandler from "../../../DomHandler";
import EventHandler from "../../../EventHandler";

import {PerspectiveCamera, Spherical} from "three";
import CameraControls from "../CameraControls";

export default class Camera extends Component {

    public camera: PerspectiveCamera;
    public controls: CameraControls;

    public gameMenuOpen: boolean;

    constructor(camera: PerspectiveCamera) {
        super();
        this.camera = camera;

        this.controls = new CameraControls(camera, true, false);

        this.gameMenuOpen = false;
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_RESIZE, this.onResize, EventHandler.Level.LOW);
        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_CLOSE, this.onGameMenuClose);

        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_REMOVAL, this.onPlayerRemoval);
        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_MOVE, this.onPlayerMove);

        this.attachControls();
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_RESIZE, this.onResize, EventHandler.Level.LOW);
        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_CLOSE, this.onGameMenuClose);

        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_REMOVAL, this.onPlayerRemoval);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_MOVE, this.onPlayerMove);

        this.detachControls();

        this.gameMenuOpen = false;
    }

    public onPlayerAddition(data: any) {
        if (!this.gameMenuOpen) {
            this.detachControls();
        }

        this.controls = new CameraControls(this.camera, true, false);
        this.controls.target = data.pos.clone().addScalar(0.5).setY(0);
        this.controls.spherical = new Spherical(25, 5 * Math.PI / 16, Math.PI);
        this.controls.update();

        if (!this.gameMenuOpen) {
            this.attachControls();
        }
    }

    public onPlayerRemoval() {
        if (!this.gameMenuOpen) {
            this.detachControls();
        }

        const target = this.controls.target;
        const spherical = this.controls.spherical;

        this.controls = new CameraControls(this.camera, false, false);

        this.controls.target = target;
        this.controls.spherical = spherical;
        this.controls.update();

        if (!this.gameMenuOpen) {
            this.attachControls();
        }

    }

    public onPlayerMove(data: any) {
        this.controls.target = data.pos.clone().addScalar(0.5).setY(0);
        this.controls.spherical.theta = data.bodyRot + Math.PI;
        this.controls.update();
    }

    public onResize() {
        const dimensions = DomHandler.getDisplayDimensions();
        this.camera.aspect = dimensions.width / dimensions.height;
        this.camera.updateProjectionMatrix();
    }

    public onGameMenuOpen() {
        this.gameMenuOpen = true;
        this.detachControls();
    }

    public onGameMenuClose() {
        this.gameMenuOpen = false;
        this.attachControls();
    }

    public attachControls() {
        this.attachChild(this.controls);
    }

    public detachControls() {
        this.detachChild(this.controls);
    }
}
