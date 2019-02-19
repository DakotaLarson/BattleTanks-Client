import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import Globals from "../Globals";

export default class ServerPlayerCount extends ChildComponent {

    private static readonly PING_TEXT = "Connecting";
    private static readonly ONLINE_TEXT = "Connected";
    private static readonly IN_GAME = " playing + ";
    private static readonly CONNECTED = " connected";
    private static readonly ERROR_TEXT = "Error";

    private parentElt: HTMLElement;
    private textElt: HTMLElement;

    private eventSource: EventSource | undefined;

    constructor(menu: HTMLElement) {
        super();
        this.parentElt = DomHandler.getElement(".server-playercount", menu);
        this.textElt = DomHandler.getElement("#playercount-text", this.parentElt);
    }

    public enable() {
        this.textElt.textContent = ServerPlayerCount.PING_TEXT;
        this.pingServer();
    }

    public disable() {
        this.closeEventSource();
        this.textElt.textContent = "";
    }

    private pingServer() {
        const address = "http" + Globals.getGlobal(Globals.Global.HOST);
        this.eventSource = new EventSource(address + "/playercount");
        this.eventSource.onopen = this.onOpen.bind(this);
        this.eventSource.onmessage = this.onMessage.bind(this);
        this.eventSource.onerror = this.onError.bind(this);
    }

    private closeEventSource() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = undefined;
        }
    }

    private onOpen() {
        this.textElt.textContent = ServerPlayerCount.ONLINE_TEXT;
    }

    private onMessage(event: any) {
        const values = event.data.split(",");
        if (values.length === 2) {
            const playerCount = parseInt(values[0], 10);
            const activeUserCount = parseInt(values[1], 10);

            let str = "";

            if (!isNaN(playerCount) && !isNaN(activeUserCount)) {
                str += playerCount + ServerPlayerCount.IN_GAME;
                str += activeUserCount + ServerPlayerCount.CONNECTED;

            } else {
                str = ServerPlayerCount.ONLINE_TEXT;
            }
            this.textElt.textContent = str;
        }
    }

    private onError(err: any) {
        console.log(err);
        this.textElt.textContent = ServerPlayerCount.ERROR_TEXT;
    }
}
