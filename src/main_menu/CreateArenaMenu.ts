import Component from "../component/ChildComponent";
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
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onCreateClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onCancelClick);

        this.element.style.display = "block";
        this.titleElt.focus();
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onCreateClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onCancelClick);

        this.titleElt.value = "";
        this.heightElt.value = "";
        this.widthElt.value = "";
        this.errorElt.textContent = "";

        this.element.style.display = "none";
    }

    public onCreateClick(event: MouseEvent) {
        if (event.target === this.createElt) {
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
    }

    public onCancelClick(event: MouseEvent) {
        if (event.target === this.cancelElt) {
            EventHandler.callEvent(EventHandler.Event.CREATEWORLDMENU_CANCEL_OPT_CLICK);
        }
    }
}
