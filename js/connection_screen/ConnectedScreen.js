import Component from '../Component';
import DomHandler from '../DomHandler';
import EventHandler from '../EventHandler';

export default class ConnectedScreen extends Component{

    constructor(parent){
        super();
        this.element = DomHandler.getElement('.section-connected', parent);
        this.disconnectElt = DomHandler.getElement('.option-disconnect', this.element);

    }

    enable = () => {
        this.disconnectElt.addEventListener('click', this.onDisconnect);
        this.element.style.display = 'block';
    };

    disable = () => {
        this.disconnectElt.addEventListener('click', this.onDisconnect);
        this.element.style.display = '';
    };

    onDisconnect = () => {
        EventHandler.callEvent(EventHandler.Event.CONNECTION_SCREEN_DISCONNECT);
    };
}