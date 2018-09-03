import Component from './Component';
import EventHandler from './EventHandler';
import PacketSender from './PacketSender';
import PacketReceiver from './PacketReceiver';
import DomEventHandler from './DomEventHandler';

const address = 'ws://localhost:8000';
const protocol = 'tanks-MP';

export default class MultiplayerConnection extends Component{

    ws: WebSocket;

    constructor(){
        super();
        this.ws = undefined;
    }

    enable(){
        this.ws = new WebSocket(address, protocol);
        this.ws.binaryType = 'arraybuffer';

        DomEventHandler.addListener(this, this.ws, 'open', this.onOpen);
        DomEventHandler.addListener(this, this.ws, 'message', this.onMessage);
        DomEventHandler.addListener(this, this.ws, 'close', this.onClose);
    }

    disable(){
        DomEventHandler.removeListener(this, this.ws, 'open', this.onOpen);
        DomEventHandler.removeListener(this, this.ws, 'message', this.onMessage);
        DomEventHandler.removeListener(this, this.ws, 'close', this.onClose);

        this.ws.close(1000);
    }

    onOpen(){
        PacketSender.setSocket(this.ws);
        this.initHandshake();
    }

    onMessage(event: MessageEvent){
        PacketReceiver.handleMessage(event.data);
    }

    initHandshake(){
        EventHandler.callEvent(EventHandler.Event.MULTIPLAYER_CONNECTION_WS_OPEN);
        PacketSender.sendPlayerJoin('Guest');
    }

    onClose(event){
        EventHandler.callEvent(EventHandler.Event.MULTIPLAYER_CONNECTION_WS_CLOSE, event);
    }

}
