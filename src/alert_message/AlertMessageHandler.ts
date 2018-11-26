import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

export default class AlertMessageHandler extends Component {

    private alertElt: HTMLElement;
    private taskId: number;

    constructor() {
        super();
        this.alertElt = DomHandler.getElement(".alert-message");
        this.taskId = -1;
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.ALERT_MESSAGE_REQUEST, this.onAlertRequest);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.ALERT_MESSAGE_REQUEST, this.onAlertRequest);
    }

    private onAlertRequest(message: string) {
        if (this.taskId !== -1) {
            clearTimeout(this.taskId);
        }
        this.alertElt.textContent = message;
        this.alertElt.style.opacity = "1";
        this.alertElt.style.display = "inline-block";
        this.taskId = window.setTimeout(() => {
            this.alertElt.style.opacity = "";
            this.taskId = window.setTimeout(() => {
                this.alertElt.style.display = "";
                this.taskId = -1;
            }, 500);
        }, 3000);
    }
}
