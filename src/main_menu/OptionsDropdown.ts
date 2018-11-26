import ChildComponent from "../component/ChildComponent";
import DomEventHandler from "../DomEventHandler";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import Options from "../Options";

export default class OptionsDropdown extends ChildComponent {

    private element: HTMLElement;
    private optionsList: HTMLElement;
    private header: HTMLElement;
    private usernameElt: HTMLElement;

    private optBtn: HTMLElement;
    private authBtn: HTMLElement;
    private signedIn: boolean;

    private hidden: boolean;

    constructor(parent: HTMLElement) {
        super();
        this.element = DomHandler.getElement(".options-dropdown", parent);
        this.optionsList = DomHandler.getElement(".options-dropdown-list", this.element);
        this.header = DomHandler.getElement(".options-dropdown-header", this.element);
        this.usernameElt = DomHandler.getElement("#options-dropdown-username", this.element);

        this.optBtn = DomHandler.getElement("#options-dropdown-option--options", this.element);
        this.authBtn = DomHandler.getElement("#options-dropdown-option--auth", this.element);

        const username = Options.options.username;
        this.usernameElt.textContent = username;

        this.hidden = true;

        this.signedIn = false;
    }

    public enable(): void {
        DomEventHandler.addListener(this, document.body, "click", this.onClick);

        EventHandler.addListener(this, EventHandler.Event.OPTIONS_UPDATE, this.onOptionsUpdate);

        EventHandler.addListener(this, EventHandler.Event.SIGN_IN, this.onSignIn);
        EventHandler.addListener(this, EventHandler.Event.SIGN_OUT, this.onSignOut);

        if (this.signedIn) {
            this.authBtn.textContent = "Sign Out";
        } else {
            this.authBtn.textContent = "Sign In";
        }
    }

    public disable(): void {
        DomEventHandler.removeListener(this, document.body, "click", this.onClick);

        EventHandler.removeListener(this, EventHandler.Event.OPTIONS_UPDATE, this.onOptionsUpdate);

        EventHandler.removeListener(this, EventHandler.Event.SIGN_IN, this.onSignIn);
        EventHandler.removeListener(this, EventHandler.Event.SIGN_OUT, this.onSignOut);

        this.hide();
    }

    private onClick(event: MouseEvent): void {
        if (event.target === this.header || this.header.contains(event.target as Node)) {
            if (this.hidden) {
                this.show();
            } else {
                this.hide();
            }
        } else if (event.target !== this.optionsList && !this.optionsList.contains(event.target as Node)) {
            if (!this.hidden) {
                this.hide();
            }
        } else if (event.target === this.optBtn) {
            EventHandler.callEvent(EventHandler.Event.TOPMENU_OPT_OPT_CLICK);
            this.hide();
        } else if (event.target === this.authBtn) {
            EventHandler.callEvent(EventHandler.Event.AUTH_REQUEST, !this.signedIn);
            this.hide();
        }
    }

    private onSignIn() {
        this.authBtn.textContent = "Sign Out";
        this.signedIn = true;
    }

    private onSignOut() {
        this.authBtn.textContent = "Sign In";
        this.signedIn = false;
    }

    private onOptionsUpdate(options: any) {
        this.usernameElt.textContent = options.username;
    }

    private show() {
        this.optionsList.style.visibility = "visible";
        this.header.classList.add("options-dropdown-header--enabled");
        this.hidden = false;
    }

    private hide() {
        this.optionsList.style.visibility = "";
        this.header.classList.remove("options-dropdown-header--enabled");
        this.hidden = true;
    }
}
