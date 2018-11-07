import Component from "../../component/ChildComponent";
import EventHandler from "../../EventHandler";

import {Spherical} from "three";

enum ButtonState {
    PRIMARY,
    SECONDARY,
    TERTIARY,
}

export default class CameraControls extends Component {

    public zoomOnly: boolean;

    private spherical: Spherical;

    private state: number;

    constructor() {
        super();

        this.spherical = new Spherical(25, Math.PI / 4, Math.PI / 3);

        this.state = -1;

        this.zoomOnly = false;
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_MOUSEDOWN, this.onMouseDown);
        EventHandler.addListener(this, EventHandler.Event.DOM_MOUSEUP, this.onMouseUp);
        EventHandler.addListener(this, EventHandler.Event.DOM_MOUSEMOVE, this.onMouseMove);
        EventHandler.addListener(this, EventHandler.Event.DOM_WHEEL, this.onWheel);
        EventHandler.callEvent(EventHandler.Event.CAMERA_CONTROLS_UPDATE, this.spherical);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_MOUSEDOWN, this.onMouseDown);
        EventHandler.removeListener(this, EventHandler.Event.DOM_MOUSEUP, this.onMouseUp);
        EventHandler.removeListener(this, EventHandler.Event.DOM_MOUSEMOVE, this.onMouseMove);
        EventHandler.removeListener(this, EventHandler.Event.DOM_WHEEL, this.onWheel);
    }

    public setFromPlayer(rot: number) {
        this.spherical.theta = rot + Math.PI;
        return this.spherical;
    }

    public reset() {
        this.spherical = new Spherical(25, Math.PI / 4, Math.PI / 3);
    }

    public resetPhi() {
        this.spherical.phi = Math.PI / 4;
    }

    private onMouseDown(event: MouseEvent) {
        if (this.state === -1) {
            switch (event.button) {
                case 0:
                    if (!this.zoomOnly) {
                        this.state = ButtonState.PRIMARY;
                    }
                    break;
                case 1:
                    this.state = ButtonState.TERTIARY;
                    break;
                case 2:
                    if (!this.zoomOnly) {
                        this.state = ButtonState.SECONDARY;
                    }
                    break;
            }
        }
    }

    private onMouseUp() {
        this.state = -1;
    }

    private onMouseMove(event: MouseEvent) {
        if (this.state === -1) { return; }
        switch (this.state) {
            case ButtonState.PRIMARY:
                this.onRotation(event.movementX, event.movementY);
                break;
            case ButtonState.SECONDARY:
                this.onPan(event.movementX, event.movementY);
                break;
            case ButtonState.TERTIARY:
                this.onZoom(event.movementY, false);
                break;
        }
    }

    private onWheel(event: MouseWheelEvent) {
        this.onZoom(event.deltaY, true);
    }

    private onRotation = (deltaX: number, deltaY: number) => {
         this.spherical.theta += deltaX * Math.PI / 180 / 3;
         this.spherical.phi += deltaY * Math.PI / 180 / 5;
         this.spherical.phi = Math.min(Math.PI / 2 - Math.PI / 24, this.spherical.phi);
         EventHandler.callEvent(EventHandler.Event.CAMERA_CONTROLS_UPDATE, this.spherical);
    }

    private onPan = (deltaX: number, deltaY: number) => {
        // Pan moves the target, which is part of the camera class.
        EventHandler.callEvent(EventHandler.Event.CAMERA_PAN, {
            x: deltaX,
            y: deltaY,
        });
    }

    private onZoom(deltaY: number, isScroll: boolean) {
        if (isScroll) {
            if (deltaY > 0) {
                this.spherical.radius = Math.min(this.spherical.radius + 2, 50);
            } else {
                this.spherical.radius = Math.max(this.spherical.radius - 2, 3);
            }
        } else {
            this.spherical.radius = Math.max(Math.min(this.spherical.radius + deltaY / 10, 50), 3);
        }
        EventHandler.callEvent(EventHandler.Event.CAMERA_CONTROLS_UPDATE, this.spherical);
    }
}
