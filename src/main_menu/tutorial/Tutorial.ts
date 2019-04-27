import ChildComponent from "../../component/ChildComponent";
import DomHandler from "../../DomHandler";
import DOMMutationHandler from "../../DOMMutationHandler";
import EventHandler from "../../EventHandler";

export default class Tutorial extends ChildComponent {

    protected contentElt: HTMLElement;

    private parentElt: HTMLElement;
    private closeBtn: HTMLElement;

    constructor(contentQuery: string) {
        super();
        this.parentElt = DomHandler.getElement(".tutorial-parent");
        this.contentElt = DomHandler.getElement(contentQuery, this.parentElt);
        this.closeBtn = DomHandler.getElement(".tutorial-close", this.parentElt);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onClick);

        DOMMutationHandler.show(this.contentElt);
        DOMMutationHandler.show(this.parentElt);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onClick);

        DOMMutationHandler.hide(this.contentElt);
        DOMMutationHandler.hide(this.parentElt);
    }

    private onClick(event: MouseEvent) {
        if (event.target === this.closeBtn || event.target === this.parentElt) {
            EventHandler.callEvent(EventHandler.Event.TUTORIAL_CLOSE);
        }
    }
}
