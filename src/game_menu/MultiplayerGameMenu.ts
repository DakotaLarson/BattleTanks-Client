import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

export default class MultiplayerGameMenu extends Component {

    private element: HTMLElement;
    private cancelBtn: HTMLElement;
    private disconnectBtn: HTMLElement;

    constructor() {
        super();
        this.element = DomHandler.getElement("#game-menu-mp");
        this.cancelBtn = DomHandler.getElement("#game-menu-mp-cancel", this.element);
        this.disconnectBtn = DomHandler.getElement("#game-menu-mp-disconnect", this.element);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onClick);

        this.element.style.display = "block";
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onClick);

        this.element.style.display = "";
    }

    private onClick(event: MouseEvent) {
        if (event.target === this.cancelBtn) {
            EventHandler.callEvent(EventHandler.Event.GAMEMENU_CLOSE_REQUEST);
        } else if (event.target === this.disconnectBtn) {
            EventHandler.callEvent(EventHandler.Event.MULTIPLAYER_DISCONNECT_REQUEST);
        }
    }
}
