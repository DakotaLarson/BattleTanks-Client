import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

import ConnectedScreen from "./ConnectedScreen";
import ConnectingScreen from "./ConnectingScreen";
import DisconnectedScreen from "./DisconnectedScreen";
import FinishingScreen from "./FinishingScreen";
import WaitingScreen from "./WaitingScreen";

export default class ConnectionScreen extends Component {

    public element: HTMLElement;

    public connectedScreen: ConnectedScreen;
    public connectingScreen: ConnectingScreen;
    public disconnectedScreen: DisconnectedScreen;
    public finishingScreen: FinishingScreen;
    public waitingScreen: WaitingScreen;

    public hidden: boolean;
    public activeScreen: Component | undefined;

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

    public onConnectionOpen() {
        this.showScreen(this.connectedScreen);
    }

    public onConnectionClose(event: CloseEvent) {
        console.log("Disconnected: " + event.code);
        this.showScreen(this.disconnectedScreen);
    }

    public onWaitingGameStatus() {
        this.showScreen(this.waitingScreen);
    }

    public onFinishingGameStatus() {
        this.showScreen(this.finishingScreen);
    }

    public onOtherGameStatus() {
        this.hide();
    }

    public showScreen(screen: Component) {
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

    public hide() {
        if (this.activeScreen) {
            this.detachChild(this.activeScreen);
            this.activeScreen = undefined;
        }
        this.element.style.display = "";
        this.hidden = true;
    }

    public show() {
        this.element.style.display = "flex";
        this.hidden = false;
    }
}
