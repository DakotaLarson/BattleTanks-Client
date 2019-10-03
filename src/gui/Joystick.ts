import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import DOMMutationHandler from "../DOMMutationHandler";
import EventHandler from "../EventHandler";

export default class Joystick extends ChildComponent {

    private container: HTMLElement;
    private joystickElt: HTMLElement;

    private dragStart: any = undefined;
    private currentPos = { x: 0, y: 0 };
    private maxDiff: number;

    constructor(parent: HTMLElement) {
        super();

        this.container = DomHandler.getElement(".joystick-container", parent);
        this.joystickElt = DomHandler.getElement(".joystick", this.container);

        this.maxDiff = this.computeMaxDiff();

    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_MOUSEDOWN, this.onStart);
        EventHandler.addListener(this, EventHandler.Event.DOM_MOUSEMOVE, this.onMove);
        EventHandler.addListener(this, EventHandler.Event.DOM_MOUSEUP, this.onEnd);

        EventHandler.addListener(this, EventHandler.Event.DOM_TOUCHSTART, this.onStart);
        EventHandler.addListener(this, EventHandler.Event.DOM_TOUCHMOVE, this.onMove);
        EventHandler.addListener(this, EventHandler.Event.DOM_TOUCHEND, this.onEnd);

        DOMMutationHandler.show(this.container);
    }

    public disable() {

        this.onEnd();

        EventHandler.removeListener(this, EventHandler.Event.DOM_MOUSEDOWN, this.onStart);
        EventHandler.removeListener(this, EventHandler.Event.DOM_MOUSEMOVE, this.onMove);
        EventHandler.removeListener(this, EventHandler.Event.DOM_MOUSEUP, this.onEnd);

        EventHandler.removeListener(this, EventHandler.Event.DOM_TOUCHSTART, this.onStart);
        EventHandler.removeListener(this, EventHandler.Event.DOM_TOUCHMOVE, this.onMove);
        EventHandler.removeListener(this, EventHandler.Event.DOM_TOUCHEND, this.onEnd);

        DOMMutationHandler.hide(this.container);
    }

    private onStart(event: any) {
        if (event.target === this.joystickElt) {
            this.joystickElt.style.transition = "0s";
            if (event.changedTouches) {
              this.dragStart = {
                x: event.changedTouches[0].clientX,
                y: event.changedTouches[0].clientY,
              };
              return;
            }
            this.dragStart = {
              x: event.clientX,
              y: event.clientY,
            };
        }
    }

    private onMove(event: any) {
        if (this.dragStart === undefined) {
             return;
        }
        if (event.changedTouches) {
            event.clientX = event.changedTouches[0].clientX;
            event.clientY = event.changedTouches[0].clientY;
        }
        const xDiff = event.clientX - this.dragStart.x;
        const yDiff = event.clientY - this.dragStart.y;

        const angle = Math.atan2(yDiff, xDiff);
        const distance = Math.min(this.maxDiff, Math.hypot(xDiff, yDiff));

        const xNew = distance * Math.cos(angle);
        const yNew = distance * Math.sin(angle);

        this.joystickElt.style.transform = `translate3d(${xNew}px, ${yNew}px, 0px)`;
        this.currentPos = { x: xNew / distance * -1, y: yNew / distance };

        EventHandler.callEvent(EventHandler.Event.JOYSTICK_MOVE, this.currentPos);
    }

    private onEnd() {
        if (this.dragStart === undefined) {
            return;
        }
        this.joystickElt.style.transition = ".2s";
        this.joystickElt.style.transform = `translate3d(0px, 0px, 0px)`;
        this.dragStart = undefined;
        this.currentPos = { x: 0, y: 0 };

        EventHandler.callEvent(EventHandler.Event.JOYSTICK_MOVE, this.currentPos);
    }

    private computeMaxDiff() {
        const minDim = Math.min(DomHandler.getDisplayDimensions().width, DomHandler.getDisplayDimensions().height);

        return minDim * 0.07;
    }
}
