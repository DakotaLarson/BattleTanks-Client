import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import DOMMutationHandler from "../DOMMutationHandler";
import EventHandler from "../EventHandler";

export default class ArenaDownloadHandler extends ChildComponent {

    private static readonly MIN_VALUE = 2;
    private static readonly MAX_VALUE = 32;
    private static readonly MAX_OFFSET = 2;

    private parent: HTMLElement;

    private returnBtn: HTMLElement;
    private downloadBtn: HTMLElement;
    private errorElt: HTMLElement;

    private titleValueElt: HTMLInputElement;
    private authorValueElt: HTMLInputElement;
    private minValueElt: HTMLInputElement;
    private maxValueElt: HTMLInputElement;

    private arenaData: any;

    private visible: boolean;

    constructor() {
        super();
        this.parent = DomHandler.getElement("#download-menu");

        this.titleValueElt = DomHandler.getElement("#download-option-title") as HTMLInputElement;
        this.authorValueElt = DomHandler.getElement("#download-option-author") as HTMLInputElement;
        this.minValueElt = DomHandler.getElement("#download-option-min") as HTMLInputElement;
        this.maxValueElt = DomHandler.getElement("#download-option-max") as HTMLInputElement;

        this.returnBtn = DomHandler.getElement("#download-menu-return", this.parent);
        this.downloadBtn = DomHandler.getElement("#download-menu-arena-download", this.parent);
        this.errorElt = DomHandler.getElement("#download-menu-error", this.parent);

        this.visible = false;
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.ARENA_SAVE_REQUEST, this.onSaveGameRequest);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.ARENA_SAVE_REQUEST, this.onSaveGameRequest);
        this.hideMenu();
    }

    private onSaveGameRequest(data: any) {
        this.arenaData = data;

        this.showMenu();
    }

    private showMenu() {
        if (!this.visible) {
            EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onReturnClick);
            EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onDownloadClick);

            DOMMutationHandler.show(this.parent);
            DOMMutationHandler.focus(this.titleValueElt);
            this.visible = true;
        }
    }

    private hideMenu() {
        if (this.visible) {
            EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onReturnClick);
            EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onDownloadClick);

            this.arenaData = undefined;

            DOMMutationHandler.setValue(this.titleValueElt);
            DOMMutationHandler.setValue(this.authorValueElt);            DOMMutationHandler.setValue(this.minValueElt);
            DOMMutationHandler.setValue(this.maxValueElt);
            DOMMutationHandler.setText(this.errorElt);

            DOMMutationHandler.hide(this.parent);
            this.visible = false;
        }
    }

    private onReturnClick(event: MouseEvent) {
        if (event.target === this.returnBtn) {
            this.hideMenu();
        }
    }

    private onDownloadClick(event: MouseEvent) {
        if (event.target === this.downloadBtn) {
            const titleValue = this.titleValueElt.value.trim();
            const authorValue = this.authorValueElt.value.trim();
            const minValue = Number(this.minValueElt.value);
            const maxValue = Number(this.maxValueElt.value);
            if (isNaN(minValue) || isNaN(maxValue) || !titleValue || !authorValue) {
                this.errorElt.textContent = "Invalid value(s)";
            } else if (minValue < ArenaDownloadHandler.MIN_VALUE || minValue > ArenaDownloadHandler.MAX_VALUE - ArenaDownloadHandler.MAX_OFFSET) {
                    this.errorElt.textContent = "Minimum value must be between " + ArenaDownloadHandler.MIN_VALUE + " - " + (ArenaDownloadHandler.MAX_VALUE - ArenaDownloadHandler.MAX_OFFSET);
            } else if (maxValue < ArenaDownloadHandler.MIN_VALUE + ArenaDownloadHandler.MAX_OFFSET ||
                    maxValue > ArenaDownloadHandler.MAX_VALUE) {
                        this.errorElt.textContent = "Maximum value must be between " + (ArenaDownloadHandler.MIN_VALUE + ArenaDownloadHandler.MAX_OFFSET) + " - " + ArenaDownloadHandler.MAX_VALUE;
            } else {
                this.arenaData.title = titleValue;
                this.arenaData.author = authorValue;
                this.arenaData.minimumPlayerCount = minValue;
                this.arenaData.maximumPlayerCount = maxValue;

                const blob = new Blob([JSON.stringify(this.arenaData)], {type : "application/json"});
                const objectURL = URL.createObjectURL(blob);
                const anchor = document.createElement("a");
                anchor.download = this.arenaData.title + ".json";
                anchor.href = objectURL;
                document.body.appendChild(anchor);
                anchor.click();
                document.body.removeChild(anchor);
                URL.revokeObjectURL(objectURL);

                this.hideMenu();
            }
        }
    }
}
