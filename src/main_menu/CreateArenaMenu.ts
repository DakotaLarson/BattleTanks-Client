import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import DOMMutationHandler from "../DOMMutationHandler";
import EventHandler from "../EventHandler";

const MAX_DIMENSION = 1000;
const MIN_DIMENSION = 3;

export default class CreateWorldMenu extends Component {

    private element: HTMLElement;

    private widthElt: HTMLInputElement;
    private heightElt: HTMLInputElement;
    private createElt: HTMLElement;
    private cancelElt: HTMLElement;
    private errorElt: HTMLElement;

    constructor(mainMenu: HTMLElement) {
        super();
        this.element = DomHandler.getElement("#sp-menu-create", mainMenu);
        this.widthElt = DomHandler.getElement("#create-opt-width", this.element) as HTMLInputElement;
        this.heightElt = DomHandler.getElement("#create-opt-height", this.element) as HTMLInputElement;
        this.createElt = DomHandler.getElement("#create-opt-create", this.element);
        this.cancelElt = DomHandler.getElement("#create-opt-cancel", this.element);
        this.errorElt = DomHandler.getElement("#create-opt-error", this.element);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onCreateClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onCancelClick);

        DOMMutationHandler.show(this.element);
        DOMMutationHandler.focus(this.widthElt);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onCreateClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onCancelClick);

        DOMMutationHandler.setValue(this.heightElt);
        DOMMutationHandler.setValue(this.widthElt);
        DOMMutationHandler.setText(this.errorElt);

        DOMMutationHandler.hide(this.element);
    }

    private onCreateClick(event: MouseEvent) {
        if (event.target === this.createElt) {
            const widthValue = Number(this.widthElt.value);
            const heightValue = Number(this.heightElt.value);

            if (isNaN(widthValue) || isNaN(heightValue)) {
                this.errorElt.textContent = "Invalid arena dimensions";
            } else if (widthValue < MIN_DIMENSION || heightValue < MIN_DIMENSION) {
                this.errorElt.textContent = "Arena dimensions cannot be less than " + MIN_DIMENSION;
            } else if (widthValue > MAX_DIMENSION || heightValue > MAX_DIMENSION) {
                this.errorElt.textContent = "Arena dimensions cannot be greater than " + MAX_DIMENSION;
            } else {
                this.errorElt.textContent = "";
                EventHandler.callEvent(EventHandler.Event.CREATEWORLDMENU_CREATE_OPT_CLICK, {
                    width: widthValue,
                    height: heightValue,
                });
            }
        }
    }

    private onCancelClick(event: MouseEvent) {
        if (event.target === this.cancelElt) {
            EventHandler.callEvent(EventHandler.Event.CREATEWORLDMENU_CANCEL_OPT_CLICK);
        }
    }
}
