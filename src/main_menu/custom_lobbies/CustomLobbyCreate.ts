import DomHandler from "../../DomHandler";
import EventHandler from "../../EventHandler";
import CustomLobbyContainer from "./CustomLobbyContainer";

export default class CustomLobbyCreate extends CustomLobbyContainer {

    private publicInputElt: HTMLInputElement;
    private botsInputElt: HTMLInputElement;

    constructor() {
        super("Create Custom Lobby", "Create", ".custom-lobby-create-parent");

        this.publicInputElt = DomHandler.getElement(".custom-lobby-public", this.containerElt) as HTMLInputElement;
        this.botsInputElt = DomHandler.getElement(".custom-lobby-bots", this.containerElt) as HTMLInputElement;

    }

    public enable() {
        super.enable();

        this.resetValues();
    }

    public disable() {

        super.disable();
    }

    protected onClick() {
        const lobby = {
            public: this.publicInputElt.checked,
            bots: this.botsInputElt.checked,
        };
        EventHandler.callEvent(EventHandler.Event.MULTIPLAYER_CONNECT_REQUEST, lobby);
    }

    private resetValues() {
        this.publicInputElt.checked = false;
        this.botsInputElt.checked = false;
    }
}
