import ChildComponent from "../../component/ChildComponent";
import EventHandler from "../../EventHandler";

export default class CameraToggleHandler extends ChildComponent {

    constructor() {
        super();
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_KEYUP, this.onKeyUp);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_KEYUP, this.onKeyUp);
    }

    private onKeyUp(event: KeyboardEvent) {
        if (event.code === "KeyT") {
            EventHandler.callEvent(EventHandler.Event.CAMERA_TOGGLE);
        }
    }
}
