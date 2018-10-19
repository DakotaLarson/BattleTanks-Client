import ChildComponent from "../../component/ChildComponent";
import EventHandler from "../../EventHandler";
import Globals from "../../Globals";

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
            if (Globals.getGlobal(Globals.Global.CAMERA_IS_FOLLOWING)) {
                Globals.setGlobal(Globals.Global.CAMERA_IS_FOLLOWING, false);
            } else {
                Globals.setGlobal(Globals.Global.CAMERA_IS_FOLLOWING, true);
            }
            EventHandler.callEvent(EventHandler.Event.CAMERA_TOGGLE);
        }
    }
}
