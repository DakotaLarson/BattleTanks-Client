import ChildComponent from "../../component/ChildComponent";
import DomHandler from "../../DomHandler";
import DOMMutationHandler from "../../DOMMutationHandler";
import EventHandler from "../../EventHandler";

export default class Overlay extends ChildComponent {

    protected contentElt: HTMLElement;

    private parentElt: HTMLElement;
    private closeBtn: HTMLElement;

    constructor(contentQuery: string) {
        super();
        this.parentElt = DomHandler.getElement(".overlay-parent");
        this.contentElt = DomHandler.getElement(contentQuery, this.parentElt);
        this.closeBtn = DomHandler.getElement(".overlay-close", this.parentElt);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK_PRIMARY, this.onOverlayClick);

        DOMMutationHandler.show(this.contentElt);
        DOMMutationHandler.show(this.parentElt);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK_PRIMARY, this.onOverlayClick);

        DOMMutationHandler.hide(this.contentElt);
        DOMMutationHandler.hide(this.parentElt);
    }

    private onOverlayClick(event: MouseEvent) {
        if (event.target === this.closeBtn || event.target === this.parentElt) {
            EventHandler.callEvent(EventHandler.Event.OVERLAY_CLOSE);
        }
    }
}
