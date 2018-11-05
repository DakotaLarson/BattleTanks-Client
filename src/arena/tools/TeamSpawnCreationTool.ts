import Component from "../../component/ChildComponent";
import EventHandler from "../../EventHandler";

export default class TeamSpawnCreationTool extends Component {

    private team: number;

    constructor(team: number) {
        super();

        this.team = team;
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_MOUSEUP, this.onMouseUp);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_MOUSEUP, this.onMouseUp);
    }

    private onMouseUp(event: MouseEvent) {
        if (event.button === 0) {
            EventHandler.callEvent(EventHandler.Event.TEAMSPAWN_CREATION_TOOL_PRIMARY, this.team);
        } else if (event.button === 2) {
            EventHandler.callEvent(EventHandler.Event.TEAMSPAWN_CREATION_TOOL_SECONDARY, this.team);
        }
    }
}