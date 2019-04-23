import ChildComponent from "../../../component/ChildComponent";
import DomEventHandler from "../../../DomEventHandler";
import DomHandler from "../../../DomHandler";
import DOMMutationHandler from "../../../DOMMutationHandler";
import EventHandler from "../../../EventHandler";

export default class LoadMenu extends ChildComponent {

    private containerElt: HTMLElement;

    private fileInputParentElt: HTMLElement;
    private loadElt: HTMLElement;
    private errorElt: HTMLElement;
    private fileNameElt: HTMLElement;
    private fileInputElt: HTMLInputElement;

    private arena: any;
    private dragCount: number;

    constructor(parentElt: HTMLElement) {
        super();

        this.containerElt = DomHandler.getElement(".side-panel-creator-section-load", parentElt);

        this.loadElt = DomHandler.getElement("#load-opt-load", this.containerElt);
        this.errorElt = DomHandler.getElement("#load-opt-error", this.containerElt);
        this.fileNameElt = DomHandler.getElement(".menu-file-name", this.containerElt);
        this.fileInputElt = DomHandler.getElement("#load-opt-file", this.containerElt) as HTMLInputElement;
        this.fileInputParentElt = DomHandler.getElement(".menu-file-input", this.containerElt);

        this.arena = undefined;
        this.dragCount = 0;
    }

    public enable() {

        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this. onLoadClick);
        DomEventHandler.addListener(this, this.fileInputElt, "change", this.onFileChange);

        DomEventHandler.addListener(this, this.fileInputParentElt, "dragover", this.onDrag);
        DomEventHandler.addListener(this, this.fileInputParentElt, "dragenter", this.onDragEnter);
        DomEventHandler.addListener(this, this.fileInputParentElt, "dragleave", this.onDragLeave);
        DomEventHandler.addListener(this, this.fileInputParentElt, "drop", this.onDrop);

        DOMMutationHandler.show(this.containerElt);
    }

    public disable() {

        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this. onLoadClick);
        DomEventHandler.removeListener(this, this.fileInputElt, "change", this.onFileChange);

        DomEventHandler.removeListener(this, this.fileInputParentElt, "dragover", this.onDrag);
        DomEventHandler.removeListener(this, this.fileInputParentElt, "dragenter", this.onDragEnter);
        DomEventHandler.removeListener(this, this.fileInputParentElt, "dragleave", this.onDragLeave);
        DomEventHandler.removeListener(this, this.fileInputParentElt, "drop", this.onDrop);

        DOMMutationHandler.setText(this.errorElt);
        DOMMutationHandler.setText(this.fileNameElt);
        DOMMutationHandler.setValue(this.fileInputElt);

        this.arena = undefined;

        DOMMutationHandler.hide(this.containerElt);
    }

    private onLoadClick(event: MouseEvent) {
        if (event.target === this.loadElt) {
            if (this.arena) {
                // call event
                EventHandler.callEvent(EventHandler.Event.LOADWORLDMENU_LOAD_OPT_CLICK, this.arena);
            } else {
                this.errorElt.textContent = "No File selected";
            }
        }
    }

    private onFileChange() {
        const files = this.fileInputElt.files;
        if (files && files.length === 1) {
            const file = files[0];
            this.parseFile(file).then(() => {
                this.fileNameElt.textContent = file.name;
            }).catch(() => {
                this.fileNameElt.textContent = "";
                this.arena = undefined;
            });
        } else {
            this.fileNameElt.textContent = "";
        }
    }

    private onDragEnter() {
        if (!this.dragCount ++) {
            this.highlightParent(true);
        }
    }

    private onDragLeave() {
        if (! -- this.dragCount) {
            this.highlightParent(false);
        }
    }

    private onDrag(event: DragEvent) {
        event.preventDefault();
    }

    private onDrop(event: DragEvent) {
        if (event.dataTransfer && event.dataTransfer.files.length === 1) {
            const file = event.dataTransfer.files[0];
            this.parseFile(file).then(() => {
                this.fileNameElt.textContent = file.name;
            }).catch(() => {
                this.fileNameElt.textContent = "";
                this.arena = undefined;
            });
        } else {
            this.fileNameElt.textContent = "";
        }
        event.preventDefault();

        this.dragCount = 0;
        this.highlightParent(false);

    }

    private parseFile(file: File) {
        return new Promise((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = (event: ProgressEvent) => {
                // @ts-ignore can use fr.result, however, requires ArrayBuffer check.
                const parsedResult = event.target.result;
                let json;
                try {
                    json = JSON.parse(parsedResult);
                } catch (ex) {
                    this.errorElt.textContent = "Invalid or corrupt file";
                    reject();
                    return;
                }
                if (json.title && json.width && json.height && json.blockPositions && json.width > 0 && json.height > 0) {
                     this.arena = json;
                     resolve();
                } else {
                    this.errorElt.textContent = "Invalid or corrupt file";
                    reject();
                }
            };
            fr.readAsText(file);
        });
    }

    private highlightParent(color: boolean) {
        if (color) {
            this.fileInputParentElt.style.borderColor = "#03c95f";
        } else {
            this.fileInputParentElt.style.borderColor = "";
        }
    }
}
