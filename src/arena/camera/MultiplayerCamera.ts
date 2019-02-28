import {PerspectiveCamera, Spherical, Vector3} from "three";
import EventHandler from "../../EventHandler";
import Globals from "../../Globals";
import Camera from "./Camera";

export default class MultiplayerCamera extends Camera {

    private static readonly FOLLOWING_POSITION = new Spherical(3, Math.PI / 3, 0);

    private lookingBehind: boolean;

    private switchTask: number | undefined;

    constructor(camera: PerspectiveCamera) {
        super(camera);

        this.spherical = MultiplayerCamera.FOLLOWING_POSITION.clone();

        this.lookingBehind = false;

    }

    public enable() {
        super.enable();

        this.lookingBehind = false;

        EventHandler.addListener(this, EventHandler.Event.PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.addListener(this, EventHandler.Event.PLAYER_REMOVAL, this.onPlayerRemoval);
        EventHandler.addListener(this, EventHandler.Event.PLAYER_MOVE, this.onPlayerMove);

        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_OPEN, this.onOverlayOpen);

        EventHandler.addListener(this, EventHandler.Event.CHAT_OPEN, this.onOverlayOpen);

        EventHandler.addListener(this, EventHandler.Event.DOM_MOUSEDOWN, this.onMouseDown);
        EventHandler.addListener(this, EventHandler.Event.DOM_MOUSEUP, this.onMouseUp);
        EventHandler.addListener(this, EventHandler.Event.ARENA_SCENE_UPDATE, this.onArenaSceneUpdate);

    }

    public disable() {
        super.disable();

        EventHandler.removeListener(this, EventHandler.Event.PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.removeListener(this, EventHandler.Event.PLAYER_REMOVAL, this.onPlayerRemoval);
        EventHandler.removeListener(this, EventHandler.Event.PLAYER_MOVE, this.onPlayerMove);

        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_OPEN, this.onOverlayOpen);

        EventHandler.removeListener(this, EventHandler.Event.CHAT_OPEN, this.onOverlayOpen);

        EventHandler.removeListener(this, EventHandler.Event.DOM_MOUSEDOWN, this.onMouseDown);
        EventHandler.removeListener(this, EventHandler.Event.DOM_MOUSEUP, this.onMouseUp);

        EventHandler.removeListener(this, EventHandler.Event.ARENA_SCENE_UPDATE, this.onArenaSceneUpdate);

        window.clearTimeout(this.switchTask);
    }

    protected onArenaSceneUpdate(data: any) {
        super.onArenaSceneUpdate(data);
        if (data.spectate) {
            this.spherical.setFromVector3(this.spectatePos);
            this.camera.position.copy(this.spectatePos);
            this.target.copy(this.spectateTarget);
            this.camera.lookAt(this.target);
        } else {
            this.spherical.copy(Camera.DEFAULT_POSITION);
            this.camera.position.setFromSpherical(this.spherical);
            this.camera.position.add(this.target);
            this.camera.lookAt(this.target);
        }

    }

    private onPlayerAddition(data: any) {
        this.spherical.copy(MultiplayerCamera.FOLLOWING_POSITION);
        this.target = new Vector3(data.pos.x + 0.5, data.pos.y, data.pos.z + 0.5);

        this.moveCamera(data.pos.w, 0, true);
        window.clearTimeout(this.switchTask);
    }

    private onPlayerRemoval() {
        this.switchTask = window.setTimeout(() => {
            this.camera.position.copy(this.spectatePos);
            this.target.copy(this.spectateTarget);
            this.camera.lookAt(this.target);
        }, 1000);

    }

    private onPlayerMove(data: any) {
        this.target = new Vector3(data.pos.x + 0.5, data.pos.y, data.pos.z + 0.5);

        this.moveCamera(data.bodyRot, data.delta, false);
    }

    private onOverlayOpen() {
        this.updateLookingBehind(false);
    }

    private onMouseDown(event: MouseEvent) {
        if (event.button === 2 && !Globals.getGlobal(Globals.Global.GAME_MENU_OPEN)) {
            this.updateLookingBehind(true);
        }
    }

    private onMouseUp(event: MouseEvent) {
        if (event.button === 2) {
            this.updateLookingBehind(false);
        }
    }

    private moveCamera(bodyRot: number, delta: number, snap: boolean) {
        let theta;
        if (this.lookingBehind) {
            theta = bodyRot;
        } else {
            theta = bodyRot + Math.PI;
        }
        this.spherical.theta = theta;
        const finalPosition = new Vector3().setFromSpherical(this.spherical).add(this.target);
        if (snap) {
            this.camera.position.copy(finalPosition);
        } else {
            const smoothedPosition = new Vector3().lerpVectors(this.camera.position, finalPosition, delta * 10);
            this.camera.position.copy(smoothedPosition);
        }
        this.camera.lookAt(this.target);
    }

    private updateLookingBehind(value: boolean) {
        this.lookingBehind = value;
        EventHandler.callEvent(EventHandler.Event.PLAYER_LOOKING_BEHIND, value);
    }
}
