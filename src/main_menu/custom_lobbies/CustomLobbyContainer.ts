import ChildComponent from "../../component/ChildComponent";
import DomHandler from "../../DomHandler";
import EventHandler from "../../EventHandler";

export default abstract class CustomLobbyContainer extends ChildComponent {

    protected containerElt: HTMLElement;

    private parentElt: HTMLElement;
    private titleElt: HTMLElement;
    private actionBtn: HTMLElement;
    private cancelBtn: HTMLElement;

    private title: string;
    private btnTitle: string;

    constructor(title: string, btnTitle: string, containerClass: string) {
        super();

        this.parentElt = DomHandler.getElement(".custom-lobby-parent");
        this.containerElt = DomHandler.getElement(containerClass, this.parentElt);

        this.titleElt = DomHandler.getElement(".custom-lobby-title", this.parentElt);
        this.actionBtn = DomHandler.getElement(".custom-lobby-action", this.parentElt);
        this.cancelBtn = DomHandler.getElement(".custom-lobby-cancel", this.parentElt);

        this.title = title;
        this.btnTitle = btnTitle;
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onBtnClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onCancelClick);

        this.setTitles();

        this.parentElt.style.display = "block";
        this.containerElt.style.display = "block";
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onBtnClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onCancelClick);

        this.parentElt.style.display = "";
        this.containerElt.style.display = "";
    }

    protected abstract onClick(): void;

    private onBtnClick(event: MouseEvent) {
        if (event.target === this.actionBtn) {
            this.onClick();
        }
    }

    private onCancelClick(event: MouseEvent) {
        if (event.target === this.cancelBtn || event.target === this.parentElt) {
            EventHandler.callEvent(EventHandler.Event.CUSTOM_LOBBY_CANCEL, this.btnTitle);
        }
    }

    private setTitles() {
        this.titleElt.textContent = this.title;
        this.actionBtn.textContent = this.btnTitle;
    }
}
