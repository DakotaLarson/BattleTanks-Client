import Component from "../../component/ChildComponent";
import EventHandler from "../../EventHandler";

export default class TeamSpawnTool extends Component {

    private team: number;

    constructor(team: number) {
        super();
        this.team = team;
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onClick);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onClick);
    }

    private onClick(event: MouseEvent) {
        if (event.button === 0) {
            EventHandler.callEvent(EventHandler.Event.TEAMSPAWN_TOOL_PRIMARY, this.team);
        } else if (event.button === 2) {
            EventHandler.callEvent(EventHandler.Event.TEAMSPAWN_TOOL_SECONDARY, this.team);
        }
    }
}
