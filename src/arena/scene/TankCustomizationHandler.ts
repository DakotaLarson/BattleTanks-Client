import Component from "../../component/Component";
import EventHandler from "../../EventHandler";
import MultiplayerConnection from "../../MultiplayerConnection";

export default class TankCustomizationHandler extends Component {

    public static readonly DEFAULT_MODEL_ID = "0";
    public static readonly DEFAULT_COLORS = [
        "bfac86",
        "635944",
        "3f5434",
        "283621",
    ];

    constructor() {
        super();
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.SIGN_IN, this.onSignIn);
        EventHandler.addListener(this, EventHandler.Event.SIGN_OUT, this.onSignOut);
    }

    private async onSignIn(token: string) {
        const selection = await MultiplayerConnection.fetchJson("/selection", {
            token,
        });

        EventHandler.callEvent(EventHandler.Event.STORE_ITEM_SELECTION_PROPAGATION, {
            colors: selection.colors,
            id: selection.tank,
        });
    }

    private onSignOut() {
        EventHandler.callEvent(EventHandler.Event.STORE_ITEM_SELECTION_PROPAGATION, {
            colors: TankCustomizationHandler.DEFAULT_COLORS,
            id: TankCustomizationHandler.DEFAULT_MODEL_ID,
        });
    }
}
