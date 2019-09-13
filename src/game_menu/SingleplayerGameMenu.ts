import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import DOMMutationHandler from "../DOMMutationHandler";
import EventHandler from "../EventHandler";
import Confirmation from "../gui/Confirmation";

export default class SinglePlayerGameMenu extends Component {

    private element: HTMLElement;
    private cancelBtn: HTMLElement;
    private saveBtn: HTMLElement;
    private returnBtn: HTMLElement;

    constructor() {
        super();
        this.element = DomHandler.getElement("#game-menu-sp");
        this.cancelBtn = DomHandler.getElement("#game-menu-sp-cancel", this.element);
        this.saveBtn = DomHandler.getElement("#game-menu-sp-world-save", this.element);
        this.returnBtn = DomHandler.getElement("#game-menu-sp-return-to-main", this.element);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK_PRIMARY, this.onClick);

        DOMMutationHandler.show(this.element);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK_PRIMARY, this.onClick);

        DOMMutationHandler.hide(this.element);
    }

    private async onClick(event: MouseEvent) {
        if (event.target === this.cancelBtn) {
            EventHandler.callEvent(EventHandler.Event.GAMEMENU_CLOSE_REQUEST);
        } else if (event.target === this.saveBtn) {
            EventHandler.callEvent(EventHandler.Event.SP_GAMEMENU_SAVE_GAME_REQUEST);
        } else if (event.target === this.returnBtn) {
            const confirmation = await Confirmation.confirm("Are you sure you want to discard changes?");
            if (confirmation) {
                EventHandler.callEvent(EventHandler.Event.SP_GAMEMENU_RETURN_TO_MAIN_REQUEST);
            }
        }
    }
}
