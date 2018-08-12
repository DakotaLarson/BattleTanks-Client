import Component from 'Component';
import EventHandler from 'EventHandler';
import PacketSender from 'PacketSender';
import PacketReceiver from 'PacketReceiver';

const address = 'ws://localhost:8000';
const protocol = 'tanks-MP';

export default class MultiplayerConnection extends Component{

    constructor(){
        super();
        this.ws = undefined;
    }

    enable = () => {
        this.ws = new WebSocket(address, protocol);
        this.ws.binaryType = 'arraybuffer';
        this.ws.addEventListener('open', () => {
            PacketSender.setSocket(this.ws);
            this.initHandshake();
        });
        this.ws.addEventListener('message', (event) => {
            PacketReceiver.handleMessage(event.data);
        });
        this.ws.addEventListener('close', this.handleClose);
        this.ws.addEventListener('error', this.handleError);
    };

    disable = () => {
        this.ws.close(1000);
    };

    initHandshake = () => {
        EventHandler.callEvent(EventHandler.Event.MULTIPLAYER_CONNECTION_WS_OPEN);
        PacketSender.sendPlayerJoin('Guest');
    };

    handleClose = (event) => {
        EventHandler.callEvent(EventHandler.Event.MULTIPLAYER_CONNECTION_WS_CLOSE, event);
    };

    handleError = (error) => {
        //console.log(error);
    };

}
