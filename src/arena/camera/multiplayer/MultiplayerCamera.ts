import {PerspectiveCamera, Vector3} from "three";
import EventHandler from "../../../EventHandler";
import Globals from "../../../Globals";
import Camera from "../Camera";
import CameraToggleHandler from "../CameraToggleHandler";

export default class MultiplayerCamera extends Camera {

    private cameraToggleHandler: CameraToggleHandler;

    constructor(camera: PerspectiveCamera) {
        super(camera);

        this.cameraToggleHandler = new CameraToggleHandler();
    }

    public enable() {
        super.enable();
        this.controls.zoomOnly = true;

        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_REMOVAL, this.onPlayerRemoval);
        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_MOVE, this.onPlayerMove);

        EventHandler.addListener(this, EventHandler.Event.CAMERA_TOGGLE, this.onCameraToggle);
    }

    public disable() {
        super.disable();

        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_REMOVAL, this.onPlayerRemoval);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_MOVE, this.onPlayerMove);

        EventHandler.removeListener(this, EventHandler.Event.CAMERA_TOGGLE, this.onCameraToggle);
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

        if (this.usingFollowingCamera()) {
            this.attachControls(true);
        }
        this.attachChild(this.cameraToggleHandler);

        this.moveCamera(pos, rot, rot);
    }

    private onPlayerRemoval() {

        this.controls.zoomOnly = false;

    }

    private onPlayerMove(data: any) {
        const pos = new Vector3(data.pos.x + 0.5, data.pos.y, data.pos.z + 0.5);
        this.moveCamera(pos, data.bodyRot, data.headRot);
    }

    private usingFollowingCamera() {
        return Globals.getGlobal(Globals.Global.CAMERA_IS_FOLLOWING);
    }

    private onCameraToggle() {
        if (this.usingFollowingCamera()) {
            this.attachControls(true);
        } else {
             this.detachControls(true);
        }
    }
}
