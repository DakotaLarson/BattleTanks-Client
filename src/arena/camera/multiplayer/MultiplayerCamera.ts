import Component from "../../../component/ChildComponent";
import DomHandler from "../../../DomHandler";
import EventHandler from "../../../EventHandler";

import {PerspectiveCamera, Spherical, Vector3} from "three";
import CameraControls from "../CameraControls";

export default class Camera extends Component {

    private camera: PerspectiveCamera;
    private controls: CameraControls;

    private gameMenuOpen: boolean;

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

        if (!this.gameMenuOpen) {
            this.attachControls();
        }

        this.onResize();
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

    private onPlayerAddition(data: any) {
        const pos = new Vector3(data.pos.x + 0.5, data.pos.y, data.pos.z + 0.5);
        const rot = data.pos.w;
        if (!this.gameMenuOpen) {
            this.detachControls();
        }

        this.controls = new CameraControls(this.camera, true, false);
        this.controls.target = pos;
        // orig: Math.PI

        // todo check if this is necessary
        if (rot < 0) {
            this.controls.spherical = new Spherical(25, 5 * Math.PI / 16, rot - Math.PI);
        } else {
            this.controls.spherical = new Spherical(25, 5 * Math.PI / 16, rot + Math.PI);
        }
        this.controls.update();

        if (!this.gameMenuOpen) {
            this.attachControls();
        }
    }

    private onPlayerRemoval() {
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

    private onPlayerMove(data: any) {
        const pos = new Vector3(data.pos.x + 0.5, data.pos.y, data.pos.z + 0.5);
        this.controls.target = pos;
        this.controls.spherical.theta = data.bodyRot + Math.PI;
        this.controls.update();
    }

    private onResize() {
        const dimensions = DomHandler.getDisplayDimensions();
        this.camera.aspect = dimensions.width / dimensions.height;
        this.camera.updateProjectionMatrix();
    }

    private onGameMenuOpen() {
        this.gameMenuOpen = true;
        this.detachControls();
    }

    private onGameMenuClose() {
        this.gameMenuOpen = false;
        this.attachControls();
    }

    private attachControls() {
        this.attachChild(this.controls);
    }

    private detachControls() {
        this.detachChild(this.controls);
    }
}
