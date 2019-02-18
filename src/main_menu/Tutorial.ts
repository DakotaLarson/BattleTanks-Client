import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

export default class Tutorial extends ChildComponent {

    private parentElt: HTMLElement;
    private contentElt: HTMLElement;
    private closeBtn: HTMLElement;

    constructor(menuElt: HTMLElement, contentQuery: string) {
        super();
        this.parentElt = DomHandler.getElement(".tutorial-parent", menuElt);
        this.contentElt = DomHandler.getElement(contentQuery, this.parentElt);
        this.closeBtn = DomHandler.getElement(".tutorial-close", this.parentElt);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onClick);

        this.contentElt.style.display = "block";
        this.parentElt.style.display = "block";
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onClick);

        this.contentElt.style.display = "";
        this.parentElt.style.display = "";
    }

    private onClick(event: MouseEvent) {
        if (event.target === this.closeBtn || event.target === this.parentElt) {
            EventHandler.callEvent(EventHandler.Event.TUTORIAL_CLOSE);
        }
    }
}
