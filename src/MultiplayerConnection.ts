import Component from "./component/ChildComponent";
import DomEventHandler from "./DomEventHandler";
import EventHandler from "./EventHandler";
import Globals from "./Globals";
import PacketReceiver from "./PacketReceiver";
import PacketSender from "./PacketSender";

export default class MultiplayerConnection extends Component {

    private static readonly PROTOCOL = "battletanks-10";

    private static readonly CLIENT_OUTDATED_CODE = 4001;
    private static readonly SERVER_OUTDATED_CODE = 4002;

    private ws: WebSocket | undefined;
    private address: string;
    private tokenId: string | undefined;

    constructor(address: string, tokenId: string | undefined) {
        super();
        this.address = address;
        this.tokenId = tokenId;
    }

    public static async fetch(endpoint: string, body: any, method?: string) {
        const address = "http" + Globals.getGlobal(Globals.Global.HOST);
        const response = await fetch(address + endpoint, {
            method: method || "post",
            mode: "cors",
            credentials: "omit",
            body: JSON.stringify(body),
            headers: {
                "content-type": "application/json",
            },
        });
        return response.json();
    }

    public enable() {
        this.ws = new WebSocket(this.address, MultiplayerConnection.PROTOCOL);
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

    private onOpen() {
        PacketSender.setSocket(this.ws);
        this.initHandshake();
    }

    private onMessage(event: MessageEvent) {
        PacketReceiver.handleMessage(event.data);
    }

    private initHandshake() {
        EventHandler.callEvent(EventHandler.Event.MULTIPLAYER_CONNECTION_WS_OPEN);
        PacketSender.sendPlayerJoin(this.tokenId);
    }

    private onClose(event: any) {
        EventHandler.callEvent(EventHandler.Event.MULTIPLAYER_CONNECTION_WS_CLOSE, event);

        if (event.code === MultiplayerConnection.CLIENT_OUTDATED_CODE) {
            EventHandler.callEvent(EventHandler.Event.MULTIPLAYER_CONNECTION_WS_CLOSE_REASON, "Your client is outdated. Try refreshing the page or try again in a few minutes.");
        } else if (event.code === MultiplayerConnection.SERVER_OUTDATED_CODE) {
            EventHandler.callEvent(EventHandler.Event.MULTIPLAYER_CONNECTION_WS_CLOSE_REASON, "The server is outdated. Try refreshing the page or try again in a few minutes.");
        }
    }
}
