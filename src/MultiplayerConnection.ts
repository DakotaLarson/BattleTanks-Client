import Component from './component/ChildComponent';
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
        PacketSender.setSocket(undefined);
    }

    onOpen(){
        PacketSender.setSocket(this.ws);
        this.initHandshake();
    }

    onMessage(event: MessageEvent){
        PacketReceiver.handleMessage(event.data);
    }

    initHandshake(){
        let number = Math.floor(Math.random() * 1000);
        EventHandler.callEvent(EventHandler.Event.MULTIPLAYER_CONNECTION_WS_OPEN);
        PacketSender.sendPlayerJoin('Guest ' + number);
    }

    onClose(event){
        EventHandler.callEvent(EventHandler.Event.MULTIPLAYER_CONNECTION_WS_CLOSE, event);
    }

}
