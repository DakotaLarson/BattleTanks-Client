import Component from "../../component/ChildComponent";
import EventHandler from "../../EventHandler";

export default class PowerupTool extends Component {

    private powerup: number;

    constructor(powerup: number) {
        super();
        this.powerup = powerup;
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onClick);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onClick);
    }

    private onClick(event: MouseEvent) {
        if (event.button === 0) {
            EventHandler.callEvent(EventHandler.Event.POWERUP_TOOL_PRIMARY, this.powerup);
        } else if (event.button === 2) {
            EventHandler.callEvent(EventHandler.Event.POWERUP_TOOL_SECONDARY, this.powerup);
        }
    }
}
