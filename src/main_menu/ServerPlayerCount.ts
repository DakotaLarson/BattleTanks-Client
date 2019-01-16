import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";

export default class ServerPlayerCount extends ChildComponent {

    private static readonly PING_TEXT = "Connecting";
    private static readonly ONLINE_TEXT = "Connected";
    private static readonly ONLINE_SINGULAR = " player connected";
    private static readonly ONLINE_PLURAL = " players connected";
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
        let address = "http://" + location.hostname + ":8000";
        const host = location.hostname;
        const prodHostname = "battletanks.app";
        const stagingHostname = "github.io";
        if (host.includes(prodHostname) || host.includes(stagingHostname)) {
            address = "https://battle-tanks-server.herokuapp.com";
        }
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
        const playerCount = parseInt(event.data, 10);
        if (!isNaN(playerCount)) {
            if (playerCount === 1) {
                this.textElt.textContent = playerCount +  ServerPlayerCount.ONLINE_SINGULAR;
            } else {
                this.textElt.textContent = playerCount + ServerPlayerCount.ONLINE_PLURAL;
            }
        } else {
            this.textElt.textContent = ServerPlayerCount.ONLINE_TEXT;
        }
    }

    private onError() {
        this.textElt.textContent = ServerPlayerCount.ERROR_TEXT;
    }
}
