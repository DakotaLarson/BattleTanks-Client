import {PerspectiveCamera, Vector3} from "three";
import DomHandler from "../../DomHandler";
import EventHandler from "../../EventHandler";
import Globals from "../../Globals";
import Camera from "./Camera";
import CameraToggleHandler from "./CameraToggleHandler";

export default class MultiplayerCamera extends Camera {

    private cameraToggleHandler: CameraToggleHandler;

    private isSpectating: boolean;
    private playerAttached: boolean;

    private cameraFrozen: boolean;

    constructor(camera: PerspectiveCamera) {
        super(camera);

        this.isSpectating = false;
        this.playerAttached = false;

        this.cameraFrozen = false;

        this.cameraToggleHandler = new CameraToggleHandler();
    }

    public enable() {
        super.enable();

        this.controls.reset();

        this.isSpectating = false;
        this.playerAttached = false;
        this.cameraFrozen = false;

        EventHandler.addListener(this, EventHandler.Event.PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.addListener(this, EventHandler.Event.PLAYER_REMOVAL, this.onPlayerRemoval);
        EventHandler.addListener(this, EventHandler.Event.PLAYER_MOVE, this.onPlayerMove);

        EventHandler.addListener(this, EventHandler.Event.PLAYER_SPECTATING, this.onSpectating);

        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_OPEN, this.onOverlayOpen);
        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_CLOSE, this.onOverlayClose);

        EventHandler.addListener(this, EventHandler.Event.CHAT_OPEN, this.onOverlayOpen);
        EventHandler.addListener(this, EventHandler.Event.CHAT_CLOSE, this.onOverlayClose);

        EventHandler.addListener(this, EventHandler.Event.DOM_MOUSEDOWN, this.onMouseDown);
        EventHandler.addListener(this, EventHandler.Event.DOM_MOUSEUP, this.onMouseUp);

        EventHandler.addListener(this, EventHandler.Event.CAMERA_TOGGLE, this.updateContols);

    }

    public disable() {
        super.disable();

        EventHandler.removeListener(this, EventHandler.Event.PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.removeListener(this, EventHandler.Event.PLAYER_REMOVAL, this.onPlayerRemoval);
        EventHandler.removeListener(this, EventHandler.Event.PLAYER_MOVE, this.onPlayerMove);

        EventHandler.removeListener(this, EventHandler.Event.PLAYER_SPECTATING, this.onSpectating);

        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_OPEN, this.onOverlayOpen);
        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_CLOSE, this.onOverlayClose);

        EventHandler.removeListener(this, EventHandler.Event.CHAT_OPEN, this.onOverlayOpen);
        EventHandler.removeListener(this, EventHandler.Event.CHAT_CLOSE, this.onOverlayClose);

        EventHandler.removeListener(this, EventHandler.Event.DOM_MOUSEDOWN, this.onMouseDown);
        EventHandler.removeListener(this, EventHandler.Event.DOM_MOUSEUP, this.onMouseUp);

        EventHandler.removeListener(this, EventHandler.Event.CAMERA_TOGGLE, this.updateContols);

        if (this.isSpectating) {
            EventHandler.removeListener(this, EventHandler.Event.ARENA_SCENE_UPDATE, this.onArenaSceneUpdate);
        }
    }

    private moveCamera(bodyRot: number, headRot: number) {
        if (this.usingFollowingCamera()) {
            if (!this.cameraFrozen) {
                this.spherical.theta = bodyRot + Math.PI;
                this.camera.position.setFromSpherical(this.spherical);
                this.camera.position.add(this.target);

                this.camera.lookAt(this.target);
            }
        } else {
            const camPos = this.target.clone();
            camPos.add(new Vector3(0.25 * Math.sin(headRot), 0.85, 0.25 * Math.cos(headRot))); // Move to front of "head"
            this.camera.position.copy(camPos);
            this.camera.rotation.setFromVector3(new Vector3(0, headRot + Math.PI, 0));
            this.cameraFrozen = false;
        }
    }

    private onPlayerAddition(data: any) {
        this.target = new Vector3(data.pos.x + 0.5, data.pos.y, data.pos.z + 0.5);

        this.playerAttached = true;
        this.isSpectating = false;
        this.controls.resetPhi();
        this.updateContols();

        this.moveCamera(data.pos.w, data.pos.w);
    }

    private onPlayerRemoval() {
        this.playerAttached = false;
        this.isSpectating = true;
        this.updateContols();
    }

    private onPlayerMove(data: any) {
        this.target = new Vector3(data.pos.x + 0.5, data.pos.y, data.pos.z + 0.5);

        this.moveCamera(data.bodyRot, data.headRot);
    }

    private usingFollowingCamera() {
        return Globals.getGlobal(Globals.Global.CAMERA_IS_FOLLOWING);
    }

    private onSpectating() {
        EventHandler.addListener(this, EventHandler.Event.ARENA_SCENE_UPDATE, this.onArenaSceneUpdate);
        this.isSpectating = true;
        this.updateContols();
    }

    private onOverlayOpen() {
        this.cameraFrozen = false;
        this.updateContols();
    }

    private onOverlayClose() {
        this.updateContols();
    }

    private updateContols() {
        if (!Globals.getGlobal(Globals.Global.GAME_MENU_OPEN) && !Globals.getGlobal(Globals.Global.CHAT_OPEN)) {
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
                        DomHandler.requestPointerLock();

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
            DomHandler.exitPointerLock();
        }
    }

    private onMouseDown(event: MouseEvent) {
        if (event.button === 2 && !Globals.getGlobal(Globals.Global.GAME_MENU_OPEN) && this.usingFollowingCamera()) {
            this.cameraFrozen = true;
        }
    }

    private onMouseUp(event: MouseEvent) {
        if (event.button === 2) {
            this.cameraFrozen = false;
            if (this.usingFollowingCamera()) {
                // this.moveCamera();
            }
        }
    }
}
