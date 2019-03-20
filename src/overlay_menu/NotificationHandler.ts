import Component from "../component/Component";
import EventHandler from "../EventHandler";
import Globals from "../Globals";

export default class NotificationHandler extends Component {

    private static readonly NOTIFICATION_TYPES = [
        "message",
        "friend_request",
        "friend_accept",
    ];

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
        const notifications = JSON.parse(event.data);
        if (notifications.length) {
            console.log(notifications);
            for (const notification of notifications) {
                const type = NotificationHandler.NOTIFICATION_TYPES[notification.type];
                if ("body" in notification) {
                    const body = JSON.parse(notification.body);
                    // Live notification; Display notification
                    this.renderNotification(type, body);
                } else {
                    EventHandler.callEvent(EventHandler.Event.NOTIFICATION_RECV, {
                        type,
                        // something
                    });
                }
            }
        }
    }

    private onError(err: any) {
        console.log(err);
    }

    private renderNotification(type: string, body: any) {
        console.log(body);
    }
}
