import Component from "../../component/ChildComponent";
import EventHandler from "../../EventHandler";

import {Spherical} from "three";
import Options from "../../Options";

enum ButtonState {
    PRIMARY,
    SECONDARY,
    TERTIARY,
}

export default class CameraControls extends Component {

    public zoomOnly: boolean;
    private angleButtonDown: boolean;

    private spherical: Spherical;

    private state: number;

    constructor(spherical: Spherical) {
        super();

        this.spherical = spherical;
        this.reset();

        this.state = -1;
        this.zoomOnly = false;
        this.angleButtonDown = false;
    }

    public enable() {
        this.state = -1;
        this.angleButtonDown = false;

        EventHandler.addListener(this, EventHandler.Event.DOM_MOUSEDOWN, this.onMouseDown);
        EventHandler.addListener(this, EventHandler.Event.DOM_MOUSEUP, this.onMouseUp);
        EventHandler.addListener(this, EventHandler.Event.DOM_MOUSEMOVE, this.onMouseMove);
        EventHandler.addListener(this, EventHandler.Event.DOM_WHEEL, this.onWheel);

        EventHandler.addListener(this, EventHandler.Event.DOM_KEYDOWN, this.onKeyDown);
        EventHandler.addListener(this, EventHandler.Event.DOM_KEYUP, this.onKeyUp);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_MOUSEDOWN, this.onMouseDown);
        EventHandler.removeListener(this, EventHandler.Event.DOM_MOUSEUP, this.onMouseUp);
        EventHandler.removeListener(this, EventHandler.Event.DOM_MOUSEMOVE, this.onMouseMove);
        EventHandler.removeListener(this, EventHandler.Event.DOM_WHEEL, this.onWheel);
        EventHandler.removeListener(this, EventHandler.Event.DOM_KEYDOWN, this.onKeyDown);
        EventHandler.removeListener(this, EventHandler.Event.DOM_KEYUP, this.onKeyUp);
    }

    public setFromPlayer(rot: number) {
        this.spherical.theta = rot + Math.PI;
        return this.spherical;
    }

    public reset() {
        this.spherical.radius = 8;
        this.spherical.phi = 11 * Math.PI / 24 * Options.options.cameraAngle;
        this.spherical.theta = Math.PI / 3;
    }

    public resetPhi() {
        this.spherical.phi = 11 * Math.PI / 24 * Options.options.cameraAngle;
        this.state = -1;
    }

    private onMouseDown(event: MouseEvent) {
        if (this.state === -1) {
            switch (event.button) {
                case 0:
                    if (!this.zoomOnly || this.angleButtonDown) {
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
        this.angleButtonDown = false;
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

    private onKeyUp(event: KeyboardEvent) {
        if (event.key === "Control" && this.zoomOnly) {
            this.angleButtonDown = false;
        }
    }

    private onKeyDown(event: KeyboardEvent) {
        if (event.key === "Control" && this.zoomOnly) {
            this.angleButtonDown = true;
        }
    }

    private onRotation = (deltaX: number, deltaY: number) => {
        if (!this.angleButtonDown) {
            this.spherical.theta -= deltaX * Math.PI / 180 / 3;
        }
        this.spherical.phi -= deltaY * Math.PI / 180 / 5;
        this.spherical.phi = Math.min(11 * Math.PI / 24, this.spherical.phi);
        this.spherical.makeSafe();
        if (this.zoomOnly) {
            // Player is in game & holding down both buttons
            const angleRatio = this.spherical.phi / (11 * Math.PI / 24);
            EventHandler.callEvent(EventHandler.Event.OPTIONS_UPDATE, {
                attribute: "cameraAngle",
                data: angleRatio,
            });
        }
        EventHandler.callEvent(EventHandler.Event.CAMERA_CONTROLS_UPDATE);
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
                this.spherical.radius = Math.min(this.spherical.radius + 2, 17);
            } else {
                this.spherical.radius = Math.max(this.spherical.radius - 2, 3);
            }
        } else {
            this.spherical.radius = Math.max(Math.min(this.spherical.radius + deltaY / 10, 50), 3);
        }
        EventHandler.callEvent(EventHandler.Event.CAMERA_CONTROLS_UPDATE);
    }
}
