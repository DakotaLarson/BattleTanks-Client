import {PerspectiveCamera, Spherical, Vector3} from "three";
import EventHandler from "../../EventHandler";
import Globals from "../../Globals";
import Options from "../../Options";
import Camera from "./Camera";

export default class MultiplayerCamera extends Camera {

    private static readonly FOLLOWING_POSITION = new Spherical(3, Math.PI / 3.125, 0);
    private static readonly MAX_GLITCHES = 5;
    private static readonly MAX_FRAMETIMES = 60;

    private lookingBehind: boolean;

    private switchTask: number | undefined;

    private frametimes: any[];
    private autofixEnabled: boolean;

    constructor(camera: PerspectiveCamera) {
        super(camera);

        this.spherical = MultiplayerCamera.FOLLOWING_POSITION.clone();

        this.lookingBehind = false;
        this.frametimes = [];
        this.autofixEnabled = false;
    }

    public enable() {
        super.enable();

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

        this.lookingBehind = false;
        this.autofixEnabled = false;
        this.frametimes = [];
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
        this.target = new Vector3(data.pos.x, data.pos.y + 0.25, data.pos.z);

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
        this.target = new Vector3(data.pos.x, data.pos.y + 0.25, data.pos.z);

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
            theta = bodyRot + Math.PI;
        } else {
            theta = bodyRot;
        }
        this.spherical.theta = theta;
        const finalPosition = new Vector3().setFromSpherical(this.spherical).add(this.target);

        if (Options.options.lazyCamera && !this.autofixEnabled && !snap) {
            const smoothedPosition = new Vector3().lerpVectors(this.camera.position, finalPosition, delta * 10);
            this.camera.position.copy(smoothedPosition);

            if (this.handleAutofix(delta)) {
                this.camera.position.copy(finalPosition);
            }

        } else {
            this.camera.position.copy(finalPosition);
        }

        this.camera.lookAt(this.target);
    }

    private handleAutofix(delta: number) {
        if (Options.options.autofixCamera) {
            if (this.checkFrametime(delta, this.frametimes)) {
                this.autofixEnabled = true;
                this.frametimes = [];
                console.log("camera autofix enabled");
                return true;
            }
        }
        return false;
    }

    private checkFrametime(delta: number, frametimes: any[]) {
        const avg = this.average(frametimes);
        let glitch = false;
        if (delta > avg * 1.5) {
            glitch = true;
        }

        frametimes.push({
            delta,
            glitch,
        });

        const quantityToRemove = frametimes.length - MultiplayerCamera.MAX_FRAMETIMES;
        if (quantityToRemove > 0) {
            frametimes.splice(0, quantityToRemove);
        }

        let glitchCount = 0;
        for (const frametime of frametimes) {
            if (frametime.glitch) {
                glitchCount ++;
            }
        }
        return glitchCount >= MultiplayerCamera.MAX_GLITCHES;
    }

    private updateLookingBehind(value: boolean) {
        this.lookingBehind = value;
        EventHandler.callEvent(EventHandler.Event.PLAYER_LOOKING_BEHIND, value);
    }

    private average(data: any[]) {
        const sum = data.reduce((total, value) => {
            return total + value.delta;
        }, 0);

        const avg = sum / data.length;
        return avg;
    }
}
