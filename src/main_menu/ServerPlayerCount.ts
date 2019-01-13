import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";

export default class ServerPlayercount extends ChildComponent {

    private static PING_TEXT = "Pinging...";
    private static OFFLINE_TEXT = "Offline";
    private static ONLINE_SINGULAR = "player online";
    private static ONLINE_PLURAL = "players online";

    private parentElt: HTMLElement;
    private textElt: HTMLElement;

    private eventSource: EventSource | undefined;

    constructor(menu: HTMLElement) {
        super();
        this.parentElt = DomHandler.getElement(".server-playercount", menu);
        this.textElt = DomHandler.getElement("#playercount-text", this.parentElt);
    }

    public enable() {
        this.textElt.textContent = ServerPlayercount.PING_TEXT;
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
        if (host.includes(prodHostname)) {
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
        console.log("opened");
    }

    private onMessage(event: any) {
        console.log(event);
    }

    private onError(error: any) {
        console.warn(error);
    }
}
