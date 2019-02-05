import ChildComponent from "../component/ChildComponent";
import DomEventHandler from "../DomEventHandler";
import DomHandler from "../DomHandler";

export default class UsernameMenu extends ChildComponent {

    private static readonly INPUT_COLOR = "#ffffff";
    private static readonly VALID_COLOR = "#02ea6e";
    private static readonly INVALID_COLOR = "#ea1d02";

    private static readonly TYPING_TIME = 500;

    private static readonly MINIMUM_LENGTH = 3;
    private static readonly MAXIMUM_LENGTH = 16;

    private parentElt: HTMLElement;
    private inputElt: HTMLInputElement;

    private typingTimeout: number | undefined;

    constructor() {
        super();
        this.parentElt = DomHandler.getElement(".username-menu-parent");
        this.inputElt = DomHandler.getElement(".username-input", this.parentElt) as HTMLInputElement;
    }

    public enable() {
        DomEventHandler.addListener(this, this.inputElt, "input", this.onInput);
        this.parentElt.style.display = "block";
        this.inputElt.focus();
    }

    public disable() {
        DomEventHandler.removeListener(this, this.inputElt, "input", this.onInput);
        this.parentElt.style.display = "";
    }

    private onInput() {
        if (this.typingTimeout) {
            window.clearTimeout(this.typingTimeout);
        }
        this.typingTimeout = window.setTimeout(() => {
            this.onTypingEnd();
            this.typingTimeout = undefined;
        }, UsernameMenu.TYPING_TIME);
        this.inputElt.style.borderColor = UsernameMenu.INPUT_COLOR;
    }

    private onTypingEnd() {
        const name = this.inputElt.value.trim();
        if (name.length < UsernameMenu.MINIMUM_LENGTH || name.length > UsernameMenu.MAXIMUM_LENGTH) {
            this.inputElt.style.borderColor = UsernameMenu.INVALID_COLOR;
        } else {
            this.inputElt.style.borderColor = UsernameMenu.VALID_COLOR;
        }
    }

    private isUsernameValid(name: string) {
        // fetch here
    }
}
