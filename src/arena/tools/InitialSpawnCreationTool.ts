import Component from "../../component/ChildComponent";
import EventHandler from "../../EventHandler";

export default class InitialSpawnCreationTool extends Component {

    constructor() {
        super();
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_MOUSEUP, this.onMouseUp);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_MOUSEUP, this.onMouseUp);
    }

    private onMouseUp(event: MouseEvent) {
        if (event.button === 0) {
            EventHandler.callEvent(EventHandler.Event.INITIALSPAWN_CREATION_TOOL_PRIMARY);
        } else if (event.button === 2) {
            EventHandler.callEvent(EventHandler.Event.INITIALSPAWN_CREATION_TOOL_SECONDARY);
        }
    }
}
