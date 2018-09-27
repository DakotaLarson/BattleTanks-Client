import Component from "../component/ChildComponent";
import DomEventHandler from "../DomEventHandler";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

const MAX_DIMENSION = 100;

export default class CreateWorldMenu extends Component {

    public element: HTMLElement;
    public titleElt: HTMLInputElement;
    public widthElt: HTMLInputElement;
    public heightElt: HTMLInputElement;
    public createElt: HTMLElement;
    public cancelElt: HTMLElement;
    public errorElt: HTMLElement;

    constructor(mainMenu: HTMLElement) {
        super();
        this.element = DomHandler.getElement("#sp-menu-create", mainMenu);
        this.titleElt = DomHandler.getElement("#create-opt-title", this.element) as HTMLInputElement;
        this.widthElt = DomHandler.getElement("#create-opt-width", this.element) as HTMLInputElement;
        this.heightElt = DomHandler.getElement("#create-opt-height", this.element) as HTMLInputElement;
        this.createElt = DomHandler.getElement("#create-opt-create", this.element);
        this.cancelElt = DomHandler.getElement("#create-opt-cancel", this.element);
        this.errorElt = DomHandler.getElement("#create-opt-error", this.element);
    }

    public enable() {
        DomEventHandler.addListener(this, this.createElt, "click", this.onCreateClick);
        DomEventHandler.addListener(this, this.cancelElt, "click", this.onCancelClick);

        this.element.style.display = "block";
        this.titleElt.focus();
    }

    public disable() {
        DomEventHandler.removeListener(this, this.createElt, "click", this.onCreateClick);
        DomEventHandler.removeListener(this, this.cancelElt, "click", this.onCancelClick);

        this.titleElt.value = "";
        this.heightElt.value = "";
        this.widthElt.value = "";
        this.errorElt.textContent = "";

        this.element.style.display = "none";
    }

    public onCreateClick() {
        const titleValue = this.titleElt.value.trim();
        const widthValue = Number(this.widthElt.value);
        const heightValue = Number(this.heightElt.value);

        if (titleValue.length === 0) {
            this.errorElt.textContent = "Missing Title";
        } else if (isNaN(widthValue) || isNaN(heightValue) || widthValue < 1 || heightValue < 1) {
            this.errorElt.textContent = "Invalid arena dimensions";
        } else if (widthValue > MAX_DIMENSION || heightValue > MAX_DIMENSION) {
            this.errorElt.textContent = "Arena dimensions cannot be greater than " + MAX_DIMENSION;
        } else {
            this.errorElt.textContent = "";
            EventHandler.callEvent(EventHandler.Event.CREATEWORLDMENU_CREATE_OPT_CLICK, {
                title: titleValue,
                width: widthValue,
                height: heightValue,
            });
        }
    }

    public onCancelClick() {
        EventHandler.callEvent(EventHandler.Event.CREATEWORLDMENU_CANCEL_OPT_CLICK);
    }
}
