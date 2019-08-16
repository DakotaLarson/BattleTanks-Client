import Component from "./component/ChildComponent";
import DomEventHandler from "./DomEventHandler";
import EventHandler from "./EventHandler";
import Globals from "./Globals";
import PacketReceiver from "./PacketReceiver";
import PacketSender from "./PacketSender";

export default class MultiplayerConnection extends Component {

    private static readonly PROTOCOL = "battletanks-";

    private static readonly CLIENT_OUTDATED_CODE = 4001;
    private static readonly SERVER_OUTDATED_CODE = 4002;

    private ws: WebSocket | undefined;

    private version: number;

    private address: string;
    private tokenId: string | undefined;

    private lobbyData: any;

    constructor(version: number, address: string, tokenId: string | undefined, lobbyData: any) {
        super();
        this.version = version;

        this.address = address;
        this.tokenId = tokenId;

        this.lobbyData = lobbyData;
    }

    public static async fetch(endpoint: string, body: any, method?: string, isFormData?: boolean) {
        const address = "http" + Globals.getGlobal(Globals.Global.HOST);
        const requestInit: RequestInit = {
            method: method || "post",
            mode: "cors",
            credentials: "omit",
            body: isFormData ? body : JSON.stringify(body),
        };
        if (!isFormData) {
            requestInit.headers = {
                "content-type": "application/json",
            };
        }
        const response = await fetch(address + endpoint, requestInit);
        return response.json();
    }

    public enable() {
        this.ws = new WebSocket(this.address, MultiplayerConnection.PROTOCOL + this.version);
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
        const data: any = {};
        if (this.lobbyData) {
            data.lobby = this.lobbyData;
        }
        if (this.tokenId) {
            data.token = this.tokenId;
        }
        PacketSender.sendPlayerJoin(data);
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
