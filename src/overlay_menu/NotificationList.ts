import Component from "../component/Component";
import DomHandler from "../DomHandler";
import DOMMutationHandler from "../DOMMutationHandler";
import EventHandler from "../EventHandler";

export default class NotificationList extends Component {

    private notificationIcon: HTMLElement;
    private redIcon: HTMLElement;

    private parentElt: HTMLElement;
    private containerElt: HTMLElement;
    private messageElt: HTMLElement;

    private notifications: Map<number, any>;
    private lastNotificationId: number;

    private listOpen: boolean;

    constructor(menuElt: HTMLElement) {
        super();
        this.notificationIcon = DomHandler.getElement(".notification-icon", menuElt);
        this.redIcon = DomHandler.getElement(".notification-notification-icon", this.notificationIcon);

        this.parentElt = DomHandler.getElement(".notification-list");
        this.containerElt = DomHandler.getElement(".notification-container", this.parentElt);
        this.messageElt = DomHandler.getElement(".notification-list-message", this.parentElt);

        this.notifications = new Map();
        this.lastNotificationId = 0;

        this.listOpen = false;
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onClick);
        EventHandler.addListener(this, EventHandler.Event.NOTIFICATION_OFFLINE, this.onOfflineNotification);
        EventHandler.addListener(this, EventHandler.Event.NOTIFICATION_RESET, this.onNotificationReset);
    }

    private onClick(event: MouseEvent) {
        if (this.listOpen) {
            if (event.target !== this.parentElt && !this.parentElt.contains(event.target as Node)) {
                this.hideList();
            } else if ((event.target as HTMLElement).id.startsWith("notification")) {
                const id = parseInt((event.target as HTMLElement).id.substr(12), 10);
                const data = this.notifications.get(id);
                if (data) {
                    EventHandler.callEvent(EventHandler.Event.PROFILE_OPEN, data.username);

                    this.notifications.delete(id);
                    this.updateElements(this.notifications.size);
                    this.containerElt.removeChild(event.target as Node);
                }
                this.hideList();
            }
        } else if (event.target === this.notificationIcon) {
            this.showList();
        }
    }

    private onOfflineNotification(event: any) {
        if (event.type === "friend_request" || event.type === "friend_accept") {

            let header: string;
            let body: string;

            if (event.type === "friend_request") {
                header = "New friend request";
                body = event.username + " sent you a friend request";
            } else {
                header = "Friend request accepted";
                body = event.username + " accepted your friend request";
            }
            const id = ++ this.lastNotificationId;

            fastdom.mutate(() => {
                const elt = this.createElt(header, body, id);
                this.containerElt.appendChild(elt);
            });

            this.notifications.set(id, {
                username: event.username,
                type: event.type,
            });
            this.updateElements(this.notifications.size);
        }
    }

    private onNotificationReset() {
        this.notifications.clear();
        while (this.containerElt.firstChild) {
            this.containerElt.removeChild(this.containerElt.firstChild);
        }
        this.updateElements(this.notifications.size);
    }

    private showList() {
        DOMMutationHandler.show(this.parentElt, "inline-block");
        this.listOpen = true;
    }

    private hideList() {
        DOMMutationHandler.hide(this.parentElt);
        this.listOpen = false;
    }

    private updateElements(quantity: number) {
        if (quantity > 0) {
            DOMMutationHandler.setText(this.redIcon, "" + quantity);
            DOMMutationHandler.show(this.redIcon);
        } else {
            DOMMutationHandler.setText(this.redIcon);
            DOMMutationHandler.hide(this.redIcon);
        }

        if (quantity) {
            DOMMutationHandler.setText(this.messageElt);
        } else {
            DOMMutationHandler.setText(this.messageElt, "No notifications");
        }
    }

    private createElt(header: string, body: string, id: number) {
        const parentElt = document.createElement("div");
        parentElt.classList.add("overlay-menu-list-child");
        parentElt.setAttribute("id", "notification" + id);

        const usernameElt = document.createElement("div");
        usernameElt.classList.add("overlay-menu-list-child-username", "overlay-menu-list-child-unread");

        usernameElt.textContent = header;

        const bodyElt = document.createElement("div");
        bodyElt.classList.add("overlay-menu-list-child-body");
        bodyElt.textContent = body;

        parentElt.appendChild(usernameElt);
        parentElt.appendChild(bodyElt);

        return parentElt;
    }

}
