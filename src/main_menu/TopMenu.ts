import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import Options from "../Options";

export default class TopMenu extends Component {

    private element: HTMLElement;
    private spBtn: HTMLElement;
    private mpBtn: HTMLElement;

    constructor(mainMenu: HTMLElement) {
        super();
        this.element = DomHandler.getElement("#main-menu-top", mainMenu);

        this.spBtn = DomHandler.getElement("#top-opt-sp", this.element);
        this.mpBtn = DomHandler.getElement("#top-opt-mp", this.element);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onSPOption);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onMPOption);

        this.element.style.display = "block";
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onSPOption);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onMPOption);

        this.element.style.display = "";
    }

    // Click Handlers
    private onSPOption(event: MouseEvent) {
        if (event.target === this.spBtn) {
            EventHandler.callEvent(EventHandler.Event.TOPMENU_SP_OPT_CLICK);
        }
    }

    private onMPOption(event: MouseEvent) {
        if (event.target === this.mpBtn) {
            this.getUsername();
            EventHandler.callEvent(EventHandler.Event.MPMENU_JOIN_OPT_CLICK);
        }
    }

    private getUsername() {
        if (!localStorage.getItem("hasUsernamePrompt") && Options.options.username === "Guest") {
            const username = window.prompt("Do you want a custom username? You can change this later in 'Options' (Accessed by the top right dropdown menu).", "Guest");
            if (username && username !== "Guest") {
                let trimmedName = username.trim();
                if (trimmedName) {
                    if (trimmedName.length > 16) {
                        trimmedName = trimmedName.substring(0, 16);
                    }
                    EventHandler.callEvent(EventHandler.Event.OPTIONS_UPDATE, {
                        attribute: "username",
                        data: trimmedName,
                    });
                }
            }
        }
        localStorage.setItem("hasUsernamePrompt", "true");
    }
}
