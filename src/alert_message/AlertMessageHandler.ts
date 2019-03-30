import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import DOMMutationHandler from "../DOMMutationHandler";
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
        DOMMutationHandler.setText(this.alertElt, message);
        DOMMutationHandler.addStyle(this.alertElt, "opacity", "1");
        DOMMutationHandler.show(this.alertElt, "inline-block");
        this.taskId = window.setTimeout(() => {
            DOMMutationHandler.removeStyle(this.alertElt, "opacity");
            this.taskId = window.setTimeout(() => {
                DOMMutationHandler.hide(this.alertElt);
                this.taskId = -1;
            }, 500);
        }, 3000);
    }
}
