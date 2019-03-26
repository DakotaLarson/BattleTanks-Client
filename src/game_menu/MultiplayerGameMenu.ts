import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

export default class MultiplayerGameMenu extends Component {

    private element: HTMLElement;
    private cancelBtn: HTMLElement;
    private disconnectBtn: HTMLElement;

    private enabled: boolean;
    private connectionMenuVisible: boolean;

    constructor() {
        super();
        this.element = DomHandler.getElement("#game-menu-mp");
        this.cancelBtn = DomHandler.getElement("#game-menu-mp-cancel", this.element);
        this.disconnectBtn = DomHandler.getElement("#game-menu-mp-disconnect", this.element);

        EventHandler.addListener(this, EventHandler.Event.CONNECTION_MENU_VISIBILITY_UPDATE, this.onConnectionMenuVisibilityUpdate);

        this.enabled = false;
        this.connectionMenuVisible = false;
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onClick);
        this.enabled = true;

        this.update();

    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onClick);
        this.enabled = false;

        this.update();

        this.element.style.display = "";
    }

    private onClick(event: MouseEvent) {
        if (event.target === this.cancelBtn) {
            EventHandler.callEvent(EventHandler.Event.GAMEMENU_CLOSE_REQUEST);
        } else if (event.target === this.disconnectBtn) {
            EventHandler.callEvent(EventHandler.Event.MULTIPLAYER_DISCONNECT_REQUEST);
        }
    }

    private onConnectionMenuVisibilityUpdate(visible: boolean) {
        this.connectionMenuVisible = visible;
        this.update();
    }

    private update() {
        if (this.enabled && !this.connectionMenuVisible) {
            this.element.style.display = "block";
        } else {
            this.element.style.display = "";
        }
    }
}
