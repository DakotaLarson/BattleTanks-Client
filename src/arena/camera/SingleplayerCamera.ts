import { PerspectiveCamera, Vector3} from "three";
import DomHandler from "../../DomHandler";
import EventHandler from "../../EventHandler";
import Camera from "./Camera";
import CameraControls from "./CameraControls";

export default class SingleplayerCamera extends Camera {

    private usingTools: boolean;
    private controls: CameraControls;

    constructor(camera: PerspectiveCamera) {
        super(camera);
        this.usingTools = false;
        this.controls = new CameraControls(this.spherical);

    }

    public enable() {
        super.enable();
        EventHandler.addListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_BLOCK, this.onToggleToOther);
        EventHandler.addListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_TEAM_A, this.onToggleToOther);
        EventHandler.addListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_TEAM_B, this.onToggleToOther);
        EventHandler.addListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_SHIELD, this.onToggleToOther);
        EventHandler.addListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_HEALTH, this.onToggleToOther);
        EventHandler.addListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_SPEED, this.onToggleToOther);
        EventHandler.addListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_AMMO, this.onToggleToOther);

        EventHandler.addListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_CAMERA, this.onToggleToCamera);

        EventHandler.addListener(this, EventHandler.Event.CREATION_TOOL_SPECTATING_POSITION_INPUT, this.onSpectatingPositionInput);

        EventHandler.addListener(this, EventHandler.Event.CAMERA_CONTROLS_UPDATE, this.onControlsUpdate);
        EventHandler.addListener(this, EventHandler.Event.ARENA_SCENE_UPDATE, this.onArenaSceneUpdate);

        EventHandler.addListener(this, EventHandler.Event.CAMERA_PAN, this.onPan);

        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_CLOSE, this.onGameMenuClose);

        this.usingTools = false;
        this.attachChild(this.controls);
    }

    public disable() {
        super.disable();
        EventHandler.removeListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_BLOCK, this.onToggleToOther);
        EventHandler.removeListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_TEAM_A, this.onToggleToOther);
        EventHandler.removeListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_TEAM_B, this.onToggleToOther);
        EventHandler.removeListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_SHIELD, this.onToggleToOther);
        EventHandler.removeListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_HEALTH, this.onToggleToOther);
        EventHandler.removeListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_SPEED, this.onToggleToOther);
        EventHandler.removeListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_AMMO, this.onToggleToOther);

        EventHandler.removeListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_CAMERA, this.onToggleToCamera);

        EventHandler.removeListener(this, EventHandler.Event.CREATION_TOOL_SPECTATING_POSITION_INPUT, this.onSpectatingPositionInput);

        EventHandler.removeListener(this, EventHandler.Event.CAMERA_CONTROLS_UPDATE, this.onControlsUpdate);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_SCENE_UPDATE, this.onArenaSceneUpdate);

        EventHandler.removeListener(this, EventHandler.Event.CAMERA_PAN, this.onPan);

        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_CLOSE, this.onGameMenuClose);

        this.detachChild(this.controls);
    }

    protected onArenaSceneUpdate(data: any) {
        super.onArenaSceneUpdate(data);
        this.spherical.copy(Camera.DEFAULT_POSITION);
        this.camera.position.setFromSpherical(this.spherical);
        this.camera.position.add(this.target);
        this.camera.lookAt(this.target);
    }

    private onToggleToCamera() {
        this.usingTools = false;
        this.attachChild(this.controls);
    }

    private onToggleToOther() {
        this.usingTools = true;
        this.detachChild(this.controls);
    }

    private onSpectatingPositionInput() {
        const position = this.camera.position;
        const target = this.target.clone().setY(0);
        EventHandler.callEvent(EventHandler.Event.CREATION_TOOL_SPECTATING_POSITION_UPDATE, {
            position,
            target,
        });
    }

    private onControlsUpdate() {
        this.camera.position.setFromSpherical(this.spherical);
        this.camera.position.add(this.target);
        this.camera.lookAt(this.target);
    }

    private onPan(data: any) {
        const deltaX = data.x;
        const deltaY = data.y;

        const offset = this.camera.position.clone();
        offset.sub(this.target);

        let targetDistance = offset.length();
        targetDistance *= Math.tan(this.camera.fov / 2 * Math.PI / 180);

        const yVec = new Vector3();
        const xVec = new Vector3();

        yVec.setFromMatrixColumn(this.camera.matrix, 0);
        xVec.copy(yVec);

        yVec.crossVectors(this.camera.up, yVec);
        yVec.multiplyScalar(2 * deltaY * targetDistance / DomHandler.getDisplayDimensions().height);
        this.target.add(yVec);

        xVec.multiplyScalar(-(2 * deltaX * targetDistance / DomHandler.getDisplayDimensions().height));
        this.target.add(xVec);

        this.camera.position.setFromSpherical(this.spherical);
        this.camera.position.add(this.target);

        this.camera.lookAt(this.target);
    }

    private onGameMenuOpen() {
        if (!this.usingTools) {
            this.detachChild(this.controls);
        }
    }

    private onGameMenuClose() {
        if (!this.usingTools) {
            this.attachChild(this.controls);
        }
    }
}
