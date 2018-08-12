import Component from 'Component';
import DomHandler from 'DomHandler';
import EventHandler from 'EventHandler';

export default class ConnectingScreen extends Component{

    constructor(parent){
        super();
        this.element = DomHandler.getElement('.section-connecting', parent);
        this.cancelElt = DomHandler.getElement('.option-cancel', this.element);

    }

    enable = () => {
        this.cancelElt.addEventListener('click', this.onCancel);
        this.element.style.display = 'block';
    };

    disable = () => {
        this.cancelElt.addEventListener('click', this.onCancel);
        this.element.style.display = '';
    };

    onCancel = () => {
        EventHandler.callEvent(EventHandler.Event.CONNECTION_SCREEN_CANCEL);
    };
}