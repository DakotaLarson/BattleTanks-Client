import Component from "../../component/ChildComponent";
import EventHandler from "../../EventHandler";

export default class BlockTool extends Component {

    private eventToCall: any;

    constructor() {
        super();
        this.eventToCall = undefined;
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_MOUSEMOVE, this.onMouseMove);
        EventHandler.addListener(this, EventHandler.Event.DOM_MOUSEDOWN, this.onMouseDown);
        EventHandler.addListener(this, EventHandler.Event.DOM_MOUSEUP, this.onMouseUp);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_MOUSEMOVE, this.onMouseMove);
        EventHandler.removeListener(this, EventHandler.Event.DOM_MOUSEDOWN, this.onMouseDown);
        EventHandler.removeListener(this, EventHandler.Event.DOM_MOUSEUP, this.onMouseUp);
    }

    private onMouseMove() {
        if (this.eventToCall) {
            EventHandler.callEvent(this.eventToCall);
        }
    }

    private onMouseDown(event: MouseEvent) {
        if (!this.eventToCall) {
            if (event.button === 0) {
                this.eventToCall = EventHandler.Event.BLOCK_TOOL_PRIMARY;
            } else if (event.button === 2) {
                this.eventToCall = EventHandler.Event.BLOCK_TOOL_SECONDARY;
            }
            EventHandler.callEvent(this.eventToCall);
        }
    }

    private onMouseUp(event: MouseEvent) {
        if (this.eventToCall) {
            if (this.eventToCall === EventHandler.Event.BLOCK_TOOL_PRIMARY && event.button === 0 || this.eventToCall === EventHandler.Event.BLOCK_TOOL_SECONDARY && event.button === 2) {
                this.eventToCall = undefined;
            }
        }
    }
}
