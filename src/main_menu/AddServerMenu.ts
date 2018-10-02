import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

export default class AddServerMenu extends Component {

    private element: HTMLElement;

    private nameInputElt: HTMLInputElement;
    private addressInputElt: HTMLInputElement;

    private cancelBtn: HTMLElement;
    private saveBtn: HTMLElement;

    constructor(mainMenu: HTMLElement) {
        super();
        this.element = DomHandler.getElement("#mp-menu-add-server", mainMenu);

        this.nameInputElt = DomHandler.getElement("#add-server-name", this.element) as HTMLInputElement;
        this.addressInputElt = DomHandler.getElement("#add-server-address", this.element) as HTMLInputElement;

        this.saveBtn = DomHandler.getElement("#add-server-opt-save", this.element);
        this.cancelBtn = DomHandler.getElement("#add-server-opt-cancel", this.element);

    }

    public enable() {

        this.nameInputElt.value = "";
        this.addressInputElt.value = "";

        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.handleCancelOptionClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.handleSaveOptClick);

        this.element.style.display = "block";

        this.nameInputElt.focus();
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.handleCancelOptionClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.handleSaveOptClick);
        this.element.style.display = "";
    }

    // Click Handlers
    private handleSaveOptClick(event: MouseEvent) {
        if (event.target === this.saveBtn) {
            const name = this.nameInputElt.value;
            const address = this.addressInputElt.value;
            if (name.length && address.length) {
                this.saveServer(name, address);
                EventHandler.callEvent(EventHandler.Event.ADDSERVERMENU_SAVE_OPT_CLICK);
            } else {
                EventHandler.callEvent(EventHandler.Event.ALERT_MESSAGE_REQUEST, "Please fill out all fields.");
            }
        }
    }

    private handleCancelOptionClick(event: MouseEvent) {
        if (event.target === this.cancelBtn) {
            EventHandler.callEvent(EventHandler.Event.ADDSERVERMENU_CANCEL_OPT_CLICK);
        }
    }

    private saveServer(name: string, address: string) {
        const rawServerList = localStorage.getItem("serverList");
        let serverList;
        if (rawServerList) {
            serverList = JSON.parse(rawServerList);
        } else {
            serverList = new Array();
        }
        serverList.push({
            name,
            address,
        });
        localStorage.setItem("serverList", JSON.stringify(serverList));
    }
}
