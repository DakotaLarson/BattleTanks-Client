import Component from "./component/ChildComponent";
import DomEventHandler from "./DomEventHandler";
import EventHandler from "./EventHandler";
import Globals from "./Globals";
import PacketReceiver from "./PacketReceiver";
import PacketSender from "./PacketSender";

const protocol = "tanks-MP";

export default class MultiplayerConnection extends Component {

    public ws: WebSocket | undefined;
    public address: string;

    constructor(address: string) {
        super();
        this.address = address;
    }

    public enable() {
        this.ws = new WebSocket(this.address, protocol);
        this.ws.binaryType = "arraybuffer";

        DomEventHandler.addListener(this, this.ws, "open", this.onOpen);
        DomEventHandler.addListener(this, this.ws, "message", this.onMessage);
        DomEventHandler.addListener(this, this.ws, "close", this.onClose);
    }

    public disable() {
        if (this.ws) {
            DomEventHandler.removeListener(this, this.ws, "open", this.onOpen);
            DomEventHandler.removeListener(this, this.ws, "message", this.onMessage);
            DomEventHandler.removeListener(this, this.ws, "close", this.onClose);

            this.ws.close(1000);
        }
        PacketSender.setSocket(undefined);

    }

    public onOpen() {
        PacketSender.setSocket(this.ws);
        this.initHandshake();
    }

    public onMessage(event: MessageEvent) {
        PacketReceiver.handleMessage(event.data);
    }

    public initHandshake() {
        EventHandler.callEvent(EventHandler.Event.MULTIPLAYER_CONNECTION_WS_OPEN);
        const name = Globals.getGlobal(Globals.Global.PLAYER_NAME);
        PacketSender.sendPlayerJoin(name);
    }

    public onClose(event: any) {
        EventHandler.callEvent(EventHandler.Event.MULTIPLAYER_CONNECTION_WS_CLOSE, event);
    }

}
