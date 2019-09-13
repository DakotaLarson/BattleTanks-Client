import DomHandler from "../../DomHandler";
import EventHandler from "../../EventHandler";
import CustomLobbyContainer from "./CustomLobbyContainer";

export default class CustomLobbyJoin extends CustomLobbyContainer {

    private static readonly CODE_REGEX = /[A-Z]/;
    private static readonly CODE_LENGTH = 4;

    private joinCodeElt: HTMLInputElement;
    private errElt: HTMLElement;

    constructor() {
        super("Join Custom Lobby", "Join", ".custom-lobby-join-parent");

        this.joinCodeElt = DomHandler.getElement(".custom-lobby-code", this.containerElt) as HTMLInputElement;
        this.errElt = DomHandler.getElement(".custom-lobby-code-err", this.containerElt);
    }

    public enable() {
        super.enable();

        this.resetValues();
        this.joinCodeElt.focus();
    }

    public disable() {

        super.disable();
    }

    protected onClick() {
        const code = this.joinCodeElt.value.trim().toUpperCase();
        if (code.length !== CustomLobbyJoin.CODE_LENGTH) {
            this.errElt.textContent = "Code must be 4 characters";
        } else if (!code.match(CustomLobbyJoin.CODE_REGEX)) {
            this.errElt.textContent = "Code is invalid";
        } else {
            const lobby = {
                code,
            };
            EventHandler.callEvent(EventHandler.Event.MULTIPLAYER_CONNECT_REQUEST, lobby);
        }
    }

    private resetValues() {
        this.joinCodeElt.value = "";
        this.errElt.textContent = "";
    }
}
