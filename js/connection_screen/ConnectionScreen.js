import Component from 'Component';
import DomHandler from 'DomHandler';
import EventHandler from 'EventHandler';

export default class ConnectionScreen extends Component{

    constructor(){
        super();
        this.element = DomHandler.getElement('.connection-screen');
        this.connectingElt = DomHandler.getElement('.section-connecting', this.element);
        this.disconnectedElt = DomHandler.getElement('.section-disconnected', this.element);
        this.connectingCancelElt = DomHandler.getElement('.option-cancel', this.connectingElt);
        this.disconnectedCancelElt = DomHandler.getElement('.option-cancel', this.disconnectedElt);
        this.connectionOpen = false;
    }

    enable = () => {

        EventHandler.addListener(EventHandler.Event.MULTIPLAYER_CONNECTION_WS_OPEN, this.onConnectionOpen);
        EventHandler.addListener(EventHandler.Event.MULTIPLAYER_CONNECTION_WS_CLOSE, this.onConnectionClose);

        this.connectingCancelElt.addEventListener('click', this.onConnectingCancel);
        this.disconnectedCancelElt.addEventListener('click', this.onDisconnectedCancel);

        this.element.style.display = 'flex';
        this.displayConnecting();
    };

    disable = () => {

        EventHandler.removeListener(EventHandler.Event.MULTIPLAYER_CONNECTION_WS_OPEN, this.onConnectionOpen);
        EventHandler.removeListener(EventHandler.Event.MULTIPLAYER_CONNECTION_WS_CLOSE, this.onConnectionClose);

        this.connectingCancelElt.removeEventListener('click', this.onConnectingCancel);
        this.disconnectedCancelElt.removeEventListener('click', this.onDisconnectedCancel);

        this.element.style.display = '';
    };

    onConnectionOpen = () => {
        this.connectionOpen = true;
        this.element.style.display = '';
    };

    onConnectionClose = (event) => {
        this.displayDisconnected();
        console.log(event.code);
    };

    onConnectingCancel = () => {
        EventHandler.callEvent(EventHandler.Event.CONNECTION_SCREEN_CONNECTING_CANCEL);
    };

    onDisconnectedCancel = () => {
        EventHandler.callEvent(EventHandler.Event.CONNECTION_SCREEN_DISCONNECTED_CANCEL);
    };

    displayDisconnected = () => {
        this.connectingElt.style.display = '';
        this.disconnectedElt.style.display = 'inline';
        if(this.connectionOpen){
            this.element.style.display = 'flex';
            this.connectionOpen = false;
        }
    };

    displayConnecting = () => {
        this.disconnectedElt.style.display = '';
        this.connectingElt.style.display = 'inline';
        if(this.connectionOpen){
            this.element.style.display = 'flex';
            this.connectionOpen = false;
        }
    };
}
