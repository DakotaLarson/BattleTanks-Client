import ChildComponent from "../component/ChildComponent";
import DomEventHandler from "../DomEventHandler";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import Globals from "../Globals";

export default class UsernameMenu extends ChildComponent {

    private static readonly INPUT_COLOR = "#ffffff";
    private static readonly VALID_COLOR = "#02ea6e";
    private static readonly INVALID_COLOR = "#ea1d02";
    private static readonly UPDATING_COLOR = "#3802ea";

    private static readonly TYPING_TIME = 500;

    private static readonly MINIMUM_LENGTH = 3;
    private static readonly MAXIMUM_LENGTH = 16;

    private parentElt: HTMLElement;
    private inputElt: HTMLInputElement;

    private saveBtn: HTMLElement;
    private cancelBtn: HTMLElement;

    private typingTimeout: number | undefined;

    private lastValidName: string | undefined;

    constructor() {
        super();
        this.parentElt = DomHandler.getElement(".username-menu-parent");
        this.inputElt = DomHandler.getElement(".username-input", this.parentElt) as HTMLInputElement;
        this.saveBtn = DomHandler.getElement("#username-save", this.parentElt);
        this.cancelBtn = DomHandler.getElement("#username-cancel", this.parentElt);
    }

    public enable() {
        DomEventHandler.addListener(this, this.inputElt, "input", this.onInput);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onSaveClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onCancelClick);

        this.parentElt.style.display = "block";
        this.inputElt.focus();
    }

    public disable() {
        DomEventHandler.removeListener(this, this.inputElt, "input", this.onInput);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onSaveClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onCancelClick);

        this.inputElt.value = "";
        this.lastValidName = undefined;
        this.updateVisuals(false, false, false);

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
        this.updateVisuals(false, false, false);
    }

    private onTypingEnd() {
        let name = this.inputElt.value;
        if (name) {
            name = name.trim();
            if (this.isNameInvalid(name)) {
                this.updateVisuals(false, true, false);
                this.lastValidName = undefined;
            } else {
                this.isUsernameTaken(name).then((status) => {
                    if (status) {
                        this.updateVisuals(false, true, false);
                        this.lastValidName = undefined;
                    } else {
                        this.updateVisuals(true, true, false);
                        this.lastValidName = name;
                    }
                }).catch((err) => {
                    console.log(err);
                });
            }
        } else {
            this.updateVisuals(false, false, false);
            this.lastValidName = undefined;
        }
    }

    private onSaveClick(event: MouseEvent) {
        if (event.target === this.saveBtn && !this.saveBtn.classList.contains("disabled")) {
            const authToken = Globals.getGlobal(Globals.Global.AUTH_TOKEN);
            if (this.lastValidName) {
                this.fetchData(authToken, this.lastValidName, true).then((status) => {
                    if (status) {
                        EventHandler.callEvent(EventHandler.Event.USERNAME_MENU_CLOSE, this.lastValidName);
                    } else {
                        console.log("Username update was not successful");
                        EventHandler.callEvent(EventHandler.Event.USERNAME_MENU_CLOSE);
                    }
                }).catch((err) => {
                    console.log(err);
                });
                this.updateVisuals(false, true, true);
            } else {
                console.log("Username update was not successful");
                EventHandler.callEvent(EventHandler.Event.USERNAME_MENU_CLOSE);
            }
        }
    }

    private onCancelClick(event: MouseEvent) {
        if (event.target === this.cancelBtn && !this.cancelBtn.classList.contains("disabled")) {
            EventHandler.callEvent(EventHandler.Event.USERNAME_MENU_CLOSE);
        }
    }

    private isUsernameTaken(name: string) {
        return new Promise((resolve, reject) => {
            const authToken = Globals.getGlobal(Globals.Global.AUTH_TOKEN);
            this.fetchData(authToken, name, false).then((status) => {
                resolve(status);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    private fetchData(authToken: string, username: string, isUpdate: boolean): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const address = "http" + Globals.getGlobal(Globals.Global.HOST);
            const body = JSON.stringify({
                token: authToken,
                username,
                isUpdate,
            });

            fetch(address + "/playerusername", {
                method: "post",
                mode: "cors",
                credentials: "omit",
                body,
                headers: {
                    "content-type": "application/json",
                },
            }).then((response: Response) => {
                return response.text();
            }).then((status: string) => {
                resolve(status === "true");
            }).catch((err) => {
                reject(err);
            });
        });
    }

    private updateVisuals(canSave: boolean, hasTyped: boolean, isUpdating: boolean) {
        if (isUpdating) {
            this.inputElt.style.borderColor = UsernameMenu.UPDATING_COLOR;
        } else if (hasTyped) {
            if (canSave) {
                this.inputElt.style.borderColor = UsernameMenu.VALID_COLOR;
            } else {
                this.inputElt.style.borderColor = UsernameMenu.INVALID_COLOR;
            }
        } else {
            this.inputElt.style.borderColor = UsernameMenu.INPUT_COLOR;
        }
        if (isUpdating) {
            this.saveBtn.classList.add("disabled");
            this.cancelBtn.classList.add("disabled");
        } else if (canSave) {
            this.saveBtn.classList.remove("disabled");
            this.cancelBtn.classList.remove("disabled");
        } else {
            this.saveBtn.classList.add("disabled");
            this.cancelBtn.classList.remove("disabled");
        }
    }

    private isNameInvalid(name: string) {
        return name.length < UsernameMenu.MINIMUM_LENGTH || name.length > UsernameMenu.MAXIMUM_LENGTH || name.toLowerCase().startsWith("guest") || name.toLowerCase().startsWith("player");
    }
}
