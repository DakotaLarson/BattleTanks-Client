import Component from '../component/ChildComponent';
import DomHandler from '../DomHandler';
import DomEventHandler from '../DomEventHandler';
import EventHandler from '../EventHandler';

export default class ConnectedScreen extends Component{

    element: HTMLElement;
    disconnectElt: HTMLElement;

    constructor(parent){
        super();
        this.element = DomHandler.getElement('.section-connected', parent);
        this.disconnectElt = DomHandler.getElement('.option-disconnect', this.element);

    }

    enable(){
        DomEventHandler.addListener(this, this.disconnectElt, 'click', this.onDisconnect);
        this.element.style.display = 'block';
    }

    disable(){
        DomEventHandler.removeListener(this, this.disconnectElt, 'click', this.onDisconnect);
        this.element.style.display = '';
    }

    onDisconnect(){
        EventHandler.callEvent(EventHandler.Event.CONNECTION_SCREEN_DISCONNECT);
    }
}