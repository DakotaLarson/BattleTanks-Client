import {PerspectiveCamera, Vector3} from "three";
import EventHandler from "../../../EventHandler";
import Globals from "../../../Globals";
import Camera from "../Camera";
import CameraToggleHandler from "../CameraToggleHandler";

export default class MultiplayerCamera extends Camera {

    private cameraToggleHandler: CameraToggleHandler;

    private isSpectating: boolean;
    private menuOpen: boolean;
    private playerAttached: boolean;

    constructor(camera: PerspectiveCamera) {
        super(camera);

        this.isSpectating = false;
        this.menuOpen = false;
        this.playerAttached = false;

        this.cameraToggleHandler = new CameraToggleHandler();
    }

    public enable() {
        super.enable();

        this.controls.reset();

        this.isSpectating = false;
        this.menuOpen = false;
        this.playerAttached = false;

        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_REMOVAL, this.onPlayerRemoval);
        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_MOVE, this.onPlayerMove);

        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_SPECTATING, this.onSpectating);

        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_CLOSE, this.onGameMenuClose);

        EventHandler.addListener(this, EventHandler.Event.CAMERA_TOGGLE, this.updateContols);

    }

    public disable() {
        super.disable();

        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_REMOVAL, this.onPlayerRemoval);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_MOVE, this.onPlayerMove);

        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_SPECTATING, this.onSpectating);

        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_CLOSE, this.onGameMenuClose);

        EventHandler.removeListener(this, EventHandler.Event.CAMERA_TOGGLE, this.updateContols);

        if (this.isSpectating) {
            EventHandler.removeListener(this, EventHandler.Event.ARENA_SCENE_UPDATE, this.onArenaSceneUpdate);
        }
    }

    private moveCamera(pos: Vector3, bodyRot: number, headRot: number) {
        if (this.usingFollowingCamera()) {
            const spherical = this.controls.setFromPlayer(bodyRot);

            this.followingSpherical = spherical;
            this.followingTarget = pos;

            this.camera.position.setFromSpherical(this.followingSpherical);
            this.camera.position.add(this.followingTarget);

            this.camera.lookAt(this.followingTarget);

        } else {
            const camPos = pos.clone();
            camPos.add(new Vector3(0.25 * Math.sin(headRot), 0.85, 0.25 * Math.cos(headRot)));
            this.camera.position.copy(camPos);
            this.camera.rotation.setFromVector3(new Vector3(0, headRot + Math.PI, 0));
        }
    }

    private onPlayerAddition(data: any) {
        const pos = new Vector3(data.pos.x + 0.5, data.pos.y, data.pos.z + 0.5);
        const rot = data.pos.w;

        this.playerAttached = true;
        this.isSpectating = false;
        this.controls.resetPhi();
        this.updateContols();

        this.moveCamera(pos, rot, rot);
    }

    private onPlayerRemoval() {
        this.playerAttached = false;
        this.isSpectating = true;
    }

    private onPlayerMove(data: any) {
        const pos = new Vector3(data.pos.x + 0.5, data.pos.y, data.pos.z + 0.5);
        this.moveCamera(pos, data.bodyRot, data.headRot);
    }

    private usingFollowingCamera() {
        return Globals.getGlobal(Globals.Global.CAMERA_IS_FOLLOWING);
    }

    private onSpectating() {
        EventHandler.addListener(this, EventHandler.Event.ARENA_SCENE_UPDATE, this.onArenaSceneUpdate);
        this.isSpectating = true;
        this.updateContols();
    }

    private onGameMenuOpen() {
        this.menuOpen = true;
        this.updateContols();
    }

    private onGameMenuClose() {
        this.menuOpen = false;
        this.updateContols();
    }

    private updateContols() {
        if (!this.menuOpen) {
            if (this.playerAttached || this.isSpectating) {
                if (this.isSpectating) {
                    this.controls.zoomOnly = false;
                    this.attachChild(this.controls);
                    this.detachChild(this.cameraToggleHandler);
                } else {
                    if (this.usingFollowingCamera()) {
                        this.controls.zoomOnly = true;
                        this.attachChild(this.controls);
                    } else {
                        this.detachChild(this.controls);
                    }
                    this.attachChild(this.cameraToggleHandler);
                }
            } else {
                this.detachChild(this.controls);
                this.detachChild(this.cameraToggleHandler);
            }
        } else {
            this.detachChild(this.controls);
            this.detachChild(this.cameraToggleHandler);
        }
    }
}
