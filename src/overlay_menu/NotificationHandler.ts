import Component from "../component/Component";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import Globals from "../Globals";

export default class NotificationHandler extends Component {

    private static readonly NOTIFICATION_TYPES = [
        "message",
        "friend_request",
        "friend_accept",
    ];
    private static readonly MAX_NOTIFICATION_LENGTH = 50;
    private static readonly MAX_VISIBLE_TIME = 5000;
    private static readonly SLIDE_TIME = 500;

    private notificationContainer: HTMLElement;

    private eventSource: EventSource | undefined;

    private notificationData: Map<string, any>;

    private lastNotificationId: number;

    constructor() {
        super();
        this.notificationContainer = DomHandler.getElement(".notification-popup-container");

        this.notificationData = new Map();
        this.lastNotificationId = 0;
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.SIGN_IN, this.onSignIn);
        EventHandler.addListener(this, EventHandler.Event.SIGN_OUT, this.onSignOut);
        EventHandler.addListener(this, EventHandler.Event.DOM_BEFOREUNLOAD, this.closeEventSource);
        EventHandler.addListener(this, EventHandler.Event.DOM_MOUSEDOWN, this.onClick);
    }

    private onClick(event: MouseEvent) {

        const data = this.notificationData.get((event.target as HTMLElement).getAttribute("id")!);
        if (data) {
            DomHandler.setInterference(true);
            if (data.type === "message") {
                EventHandler.callEvent(EventHandler.Event.CONVERSATION_OPEN, data.username);
            } else if (data.type === "friend") {
                EventHandler.callEvent(EventHandler.Event.PROFILE_OPEN, data.username);
            }
        }
    }

    private onSignIn(token: string) {
        this.closeEventSource();
        EventHandler.callEvent(EventHandler.Event.NOTIFICATION_RESET);
        this.openEventSource(token);
    }

    private onSignOut() {
        EventHandler.callEvent(EventHandler.Event.NOTIFICATION_RESET);
        this.closeEventSource();
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
            for (const notification of notifications) {
                const type = NotificationHandler.NOTIFICATION_TYPES[notification.type];
                if ("body" in notification) {
                    const body = JSON.parse(notification.body);
                    // Live notification; Display notification
                    this.renderNotification(type, body);
                    EventHandler.callEvent(EventHandler.Event.NOTIFICATION_ONLINE, {
                        type,
                        body,
                    });
                } else {
                    EventHandler.callEvent(EventHandler.Event.NOTIFICATION_OFFLINE, {
                        type,
                        username: notification.username,
                    });
                }
            }
        }
    }

    private onError(err: any) {
        console.log(err);
    }

    private renderNotification(type: string, body: any) {
        let title: string;
        let message: string;

        const notificationData: any = {};

        if (type === "message") {
            title = "Message from " + body.username;
            message = body.message;

            notificationData.type = "message";
        } else if (type === "friend_request" || type === "friend_accept") {
            if (type === "friend_request") {
                title = "New Friend Request";
            } else {
                title = "Friend Request Accepted";
            }
            message = body.username + " " + body.message;

            notificationData.type = "friend";
        } else {
            throw new Error("Unknown notification type: " + type);
        }

        notificationData.username = body.username;

        if (message.length > NotificationHandler.MAX_NOTIFICATION_LENGTH) {
            message = message.substr(0, NotificationHandler.MAX_NOTIFICATION_LENGTH);
        }

        const elt = this.createNotificationElt(title, message);
        this.notificationContainer.appendChild(elt);

        this.notificationData.set(elt.getAttribute("id")!, notificationData);

        setTimeout(() => {
            elt.classList.add("notification-slide-out");
            setTimeout(() => {
                this.notificationContainer.removeChild(elt);

                this.notificationData.delete(elt.getAttribute("id")!);
            }, NotificationHandler.SLIDE_TIME);
        }, NotificationHandler.MAX_VISIBLE_TIME);
    }

    private createNotificationElt(title: string, body: string) {
        const parentElt = document.createElement("div");
        parentElt.classList.add("notification-parent");
        parentElt.setAttribute("id", "notification-" + this.lastNotificationId ++);

        const titleElt = document.createElement("div");
        titleElt.textContent = title;
        titleElt.classList.add("notification-title");
        parentElt.appendChild(titleElt);

        const bodyElt = document.createElement("div");
        bodyElt.textContent = body;
        bodyElt.classList.add("notification-body");
        parentElt.appendChild(bodyElt);

        return parentElt;
    }
}
