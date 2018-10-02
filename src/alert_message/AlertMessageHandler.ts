import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

export default class AlertMessageHandler extends Component {

    private parentElt: HTMLElement;
    private alertElt: HTMLElement;
    private taskId: number;

    constructor() {
        super();
        this.parentElt = DomHandler.getElement(".alert-message-parent");
        this.alertElt = DomHandler.getElement(".alert-message", this.parentElt);
        this.taskId = -1;
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.ALERT_MESSAGE_REQUEST, this.onAlertRequest);

    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.ALERT_MESSAGE_REQUEST, this.onAlertRequest);
    }

    private onAlertRequest(message: string) {
        if (this.taskId === -1) {
            this.alertElt.textContent = message;
            this.parentElt.style.opacity = "1";
            this.taskId = window.setTimeout(() => {
                this.parentElt.style.opacity = "0";
                this.taskId = -1;
            }, 3000);
        } else {
            clearTimeout(this.taskId);
            this.alertElt.textContent = message;
            this.taskId = window.setTimeout(() => {
                this.parentElt.style.opacity = "0";
                this.taskId = -1;
            }, 3000);
        }
    }
}
