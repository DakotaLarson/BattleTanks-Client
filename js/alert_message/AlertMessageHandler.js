import Component from '../Component';
import DomHandler from '../DomHandler';
import EventHandler from '../EventHandler';

export default class AlertMessageHandler extends Component{

    constructor(){
        super();
        this.parentElt = DomHandler.getElement('.alert-message-parent');
        this.alertElt = DomHandler.getElement('.alert-message', this.parentElt);
        this.taskId = -1;
    }

    enable(){
        EventHandler.addListener(this, this, EventHandler.Event.ALERT_MESSAGE_REQUEST, this.onAlertRequest);

    }

    disable(){
        EventHandler.removeListener(this, this, EventHandler.Event.ALERT_MESSAGE_REQUEST, this.onAlertRequest);
    }

    onAlertRequest(message){
        if(this.taskId === -1){
            this.alertElt.textContent = message;
            this.parentElt.style.opacity = '1';
            this.taskId = setTimeout(() => {
                this.parentElt.style.opacity = '0';
                this.taskId = -1;
            }, 3000);
        }else{
            clearTimeout(this.taskId);
            this.alertElt.textContent = message;
            this.taskId = setTimeout(() => {
                this.parentElt.style.opacity = '0';
                this.taskId = -1;
            }, 3000);
        }
    }
}