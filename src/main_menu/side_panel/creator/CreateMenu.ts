import ChildComponent from "../../../component/ChildComponent";
import DomHandler from "../../../DomHandler";
import DOMMutationHandler from "../../../DOMMutationHandler";
import EventHandler from "../../../EventHandler";

export default class CreateMenu extends ChildComponent {

    private static readonly MAX_DIMENSION = 1000;
    private static readonly MIN_DIMENSION = 5;

    private containerElt: HTMLElement;

    private widthElt: HTMLInputElement;
    private heightElt: HTMLInputElement;
    private createElt: HTMLElement;
    private errorElt: HTMLElement;

    constructor(parentElt: HTMLElement) {
        super();

        this.containerElt = DomHandler.getElement(".side-panel-creator-section-create", parentElt);

        this.widthElt = DomHandler.getElement("#create-opt-width", this.containerElt) as HTMLInputElement;
        this.heightElt = DomHandler.getElement("#create-opt-height", this.containerElt) as HTMLInputElement;
        this.createElt = DomHandler.getElement("#create-opt-create", this.containerElt);
        this.errorElt = DomHandler.getElement("#create-opt-error", this.containerElt);
    }

    public enable() {

        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onCreateClick);

        DOMMutationHandler.show(this.containerElt);
        DOMMutationHandler.focus(this.widthElt);
    }

    public disable() {

        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onCreateClick);

        DOMMutationHandler.setValue(this.heightElt);
        DOMMutationHandler.setValue(this.widthElt);
        DOMMutationHandler.setText(this.errorElt);

        DOMMutationHandler.hide(this.containerElt);

    }

    private onCreateClick(event: MouseEvent) {
        if (event.target === this.createElt) {
            const widthValue = Number(this.widthElt.value);
            const heightValue = Number(this.heightElt.value);

            if (isNaN(widthValue) || isNaN(heightValue)) {
                this.errorElt.textContent = "Invalid arena dimensions";
            } else if (widthValue < CreateMenu.MIN_DIMENSION || heightValue < CreateMenu.MIN_DIMENSION) {
                this.errorElt.textContent = "Arena dimensions cannot be less than " + CreateMenu.MIN_DIMENSION;
            } else if (widthValue > CreateMenu.MAX_DIMENSION || heightValue > CreateMenu.MAX_DIMENSION) {
                this.errorElt.textContent = "Arena dimensions cannot be greater than " + CreateMenu.MAX_DIMENSION;
            } else {
                this.errorElt.textContent = "";
                EventHandler.callEvent(EventHandler.Event.CREATEWORLDMENU_CREATE_OPT_CLICK, {
                    width: widthValue,
                    height: heightValue,
                });
            }
        }
    }
}
