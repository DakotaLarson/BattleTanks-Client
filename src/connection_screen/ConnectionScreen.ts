import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

import ConnectedScreen from "./ConnectedScreen";
import ConnectingScreen from "./ConnectingScreen";
import DisconnectedScreen from "./DisconnectedScreen";
import FinishingScreen from "./FinishingScreen";
import WaitingScreen from "./WaitingScreen";

export default class ConnectionScreen extends Component {

    private element: HTMLElement;

    private connectedScreen: ConnectedScreen;
    private connectingScreen: ConnectingScreen;
    private disconnectedScreen: DisconnectedScreen;
    private finishingScreen: FinishingScreen;
    private waitingScreen: WaitingScreen;

    private hidden: boolean;
    private activeScreen: Component | undefined;

    constructor() {
        super();
        this.element = DomHandler.getElement(".connection-screen");

        this.connectedScreen = new ConnectedScreen(this.element);
        this.connectingScreen = new ConnectingScreen(this.element);
        this.disconnectedScreen = new DisconnectedScreen(this.element);
        this.finishingScreen = new FinishingScreen(this.element);
        this.waitingScreen = new WaitingScreen(this.element);

        this.hidden = false;
        this.activeScreen = undefined;
    }

    public enable() {

        EventHandler.addListener(this, EventHandler.Event.MULTIPLAYER_CONNECTION_WS_OPEN, this.onConnectionOpen);
        EventHandler.addListener(this, EventHandler.Event.MULTIPLAYER_CONNECTION_WS_CLOSE, this.onConnectionClose);

        EventHandler.addListener(this, EventHandler.Event.GAME_STATUS_WAITING, this.onWaitingGameStatus);
        EventHandler.addListener(this, EventHandler.Event.GAME_STATUS_PREPARING, this.onOtherGameStatus);
        EventHandler.addListener(this, EventHandler.Event.GAME_STATUS_RUNNING, this.onOtherGameStatus);
        EventHandler.addListener(this, EventHandler.Event.GAME_STATUS_FINISHING, this.onFinishingGameStatus);

        this.element.style.display = "flex";
        this.showScreen(this.connectingScreen);
    }

    public disable() {

        EventHandler.removeListener(this, EventHandler.Event.MULTIPLAYER_CONNECTION_WS_OPEN, this.onConnectionOpen);
        EventHandler.removeListener(this, EventHandler.Event.MULTIPLAYER_CONNECTION_WS_CLOSE, this.onConnectionClose);

        EventHandler.removeListener(this, EventHandler.Event.GAME_STATUS_WAITING, this.onWaitingGameStatus);
        EventHandler.removeListener(this, EventHandler.Event.GAME_STATUS_PREPARING, this.onOtherGameStatus);
        EventHandler.removeListener(this, EventHandler.Event.GAME_STATUS_RUNNING, this.onOtherGameStatus);
        EventHandler.removeListener(this, EventHandler.Event.GAME_STATUS_FINISHING, this.onFinishingGameStatus);

        this.element.style.display = "";
    }

    private onConnectionOpen() {
        this.showScreen(this.connectedScreen);
    }

    private onConnectionClose(event: CloseEvent) {
        console.log("Disconnected: " + event.code);
        this.showScreen(this.disconnectedScreen);
    }

    private onWaitingGameStatus() {
        // this.showScreen(this.waitingScreen);
        this.hide();
    }

    private onFinishingGameStatus() {
        this.showScreen(this.finishingScreen);
    }

    private onOtherGameStatus() {
        this.hide();
    }

    private showScreen(screen: Component) {
        if (this.hidden) {
            this.show();
        }
        if (this.activeScreen) {
            if (this.activeScreen !== screen) {
                this.detachChild(this.activeScreen);
                this.attachChild(screen);
                this.activeScreen = screen;
            }
        } else {
            this.attachChild(screen);
            this.activeScreen = screen;
        }
    }

    private hide() {
        if (this.activeScreen) {
            this.detachChild(this.activeScreen);
            this.activeScreen = undefined;
        }
        this.element.style.display = "";
        this.hidden = true;
    }

    private show() {
        this.element.style.display = "flex";
        this.hidden = false;
    }
}
