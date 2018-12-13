import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

export default class ArenaDownloadHandler extends ChildComponent {

    private static readonly MIN_VALUE = 2;
    private static readonly MAX_VALUE = 32;
    private static readonly MAX_OFFSET = 2;

    private parent: HTMLElement;

    private returnBtn: HTMLElement;
    private downloadBtn: HTMLElement;
    private errorElt: HTMLElement;

    private minValueElt: HTMLInputElement;
    private recValueElt: HTMLInputElement;
    private maxValueElt: HTMLInputElement;

    private arenaData: any;

    private visible: boolean;

    constructor() {
        super();
        this.parent = DomHandler.getElement("#download-menu");

        this.minValueElt = DomHandler.getElement("#download-option-min") as HTMLInputElement;
        this.recValueElt = DomHandler.getElement("#download-option-rec") as HTMLInputElement;
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

            this.parent.style.display = "block";
            this.minValueElt.focus();
            this.visible = true;
        }
    }

    private hideMenu() {
        if (this.visible) {
            EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onReturnClick);
            EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onDownloadClick);

            this.arenaData = undefined;

            this.minValueElt.value = "";
            this.recValueElt.value = "";
            this.maxValueElt.value = "";
            this.errorElt.textContent = "";

            this.parent.style.display = "";
            this.visible = false;
        }
    }

    private onReturnClick(event: MouseEvent) {
        if (event.target === this.returnBtn) {
            this.hideMenu();
        }
    }

    private onDownloadClick(event: MouseEvent) {
        console.log("reached");
        if (event.target === this.downloadBtn) {
            const minValue = Number(this.minValueElt.value);
            const recValue = Number(this.recValueElt.value);
            const maxValue = Number(this.maxValueElt.value);
            if (isNaN(minValue) || isNaN(recValue) || isNaN(maxValue)) {
                this.errorElt.textContent = "Invalid value(s)";
            } else if (minValue < ArenaDownloadHandler.MIN_VALUE ||
                minValue > ArenaDownloadHandler.MAX_VALUE ||
                recValue < ArenaDownloadHandler.MIN_VALUE ||
                recValue > ArenaDownloadHandler.MAX_VALUE) {
                    this.errorElt.textContent = "Minimum & Recommended values must be between " + ArenaDownloadHandler.MIN_VALUE + " - " + ArenaDownloadHandler.MAX_VALUE;
            } else if (maxValue < ArenaDownloadHandler.MIN_VALUE + ArenaDownloadHandler.MAX_OFFSET ||
                    maxValue > ArenaDownloadHandler.MAX_VALUE + ArenaDownloadHandler.MAX_OFFSET) {
                        this.errorElt.textContent = "Maximum value must be between " + (ArenaDownloadHandler.MIN_VALUE + ArenaDownloadHandler.MAX_OFFSET) + " - " + (ArenaDownloadHandler.MAX_VALUE + ArenaDownloadHandler.MAX_OFFSET);
            } else {
                this.arenaData.minimumPlayerCount = minValue;
                this.arenaData.recommendedPlayerCount = recValue;
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
