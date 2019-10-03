import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import PacketSender from "../PacketSender";

export default class TouchControls extends ChildComponent {

    private parentElt: HTMLElement;
    private boostBtn: HTMLElement;
    private reloadBtn: HTMLElement;
    private menuBtn: HTMLElement;

    constructor(guiElt: HTMLElement) {
        super();

        this.parentElt = DomHandler.getElement(".touch-controls", guiElt);
        this.boostBtn = DomHandler.getElement(".touch-controls-boost", this.parentElt);
        this.reloadBtn = DomHandler.getElement(".touch-controls-reload", this.parentElt);
        this.menuBtn = DomHandler.getElement(".touch-controls-menu", this.parentElt);
    }

    public enable() {
        this.parentElt.style.display = "block";
        EventHandler.addListener(this, EventHandler.Event.DOM_TOUCHSTART, this.onTouch);
    }

    public disable() {
        this.parentElt.style.display = "";
        EventHandler.removeListener(this, EventHandler.Event.DOM_TOUCHSTART, this.onTouch);
    }

    private onTouch(event: TouchEvent) {
        if (event.target === this.boostBtn) {
            PacketSender.sendPlayerRam();
        } else if (event.target === this.reloadBtn) {
            PacketSender.sendReloadRequest();
        } else if (event.target === this.menuBtn) {
            EventHandler.callEvent(EventHandler.Event.GAMEMENU_OPEN_REQUEST);
        }
    }

}
