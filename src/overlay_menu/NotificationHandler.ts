import Component from "../component/Component";
import EventHandler from "../EventHandler";
import Globals from "../Globals";

export default class NotificationHandler extends Component {

    private eventSource: EventSource | undefined;

    constructor() {
        super();
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.SIGN_IN, this.openEventSource);
        EventHandler.addListener(this, EventHandler.Event.SIGN_OUT, this.closeEventSource);
        EventHandler.addListener(this, EventHandler.Event.DOM_BEFOREUNLOAD, this.closeEventSource);
    }

    private openEventSource(token: string) {
        const address = "http" + Globals.getGlobal(Globals.Global.HOST);
        const encodedToken = encodeURIComponent(token);
        this.eventSource = new EventSource(address + "/notification?token=" + encodedToken);
        this.eventSource.onmessage = this.onMessage.bind(this);
        this.eventSource.onerror = this.onError.bind(this);
    }

    private closeEventSource() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = undefined;
        }
    }

    private onMessage(event: any) {
        // console.log(event.data);
    }

    private onError(err: any) {
        console.log(err);
    }
}
