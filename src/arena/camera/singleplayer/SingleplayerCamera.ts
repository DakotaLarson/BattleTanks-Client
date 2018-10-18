import { PerspectiveCamera, Spherical, Vector3 } from "three";
import EventHandler from "../../../EventHandler";
import Camera from "../Camera";

export default class SingleplayerCamera extends Camera {

    constructor(camera: PerspectiveCamera) {
        super(camera);
    }

    public enable() {
        super.enable();
        this.controls.zoomOnly = false;
        EventHandler.addListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_BLOCK, this.onToggleToOther);
        EventHandler.addListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_GAMESPAWN, this.onToggleToOther);
        EventHandler.addListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_INITIALSPAWN, this.onToggleToOther);

        EventHandler.addListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_CAMERA, this.onToggleToCamera);

        EventHandler.addListener(this, EventHandler.Event.ARENA_SCENE_UPDATE, this.onArenaSceneUpdate);

        this.attachControls(true);
    }

    public disable() {
        super.disable();
        EventHandler.removeListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_BLOCK, this.onToggleToOther);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_GAMESPAWN, this.onToggleToOther);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_INITIALSPAWN, this.onToggleToOther);

        EventHandler.removeListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_CAMERA, this.onToggleToCamera);

        EventHandler.removeListener(this, EventHandler.Event.ARENA_SCENE_UPDATE, this.onArenaSceneUpdate);

        this.detachControls(true);
    }

    private onToggleToCamera() {
        this.attachControls(true);
    }

    private onToggleToOther() {
        this.detachControls(true);
    }

    private onArenaSceneUpdate(data: any) {
        this.followingTarget = new Vector3(data.width / 2, 0, data.height / 2);

        this.followingSpherical = new Spherical(25, Math.PI / 4, Math.PI / 3);
        this.followingSpherical.makeSafe();

        this.camera.position.setFromSpherical(this.followingSpherical);
        this.camera.position.add(this.followingTarget);

        this.camera.lookAt(this.followingTarget);
    }
}
