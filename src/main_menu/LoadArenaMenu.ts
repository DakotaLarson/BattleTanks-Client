import Component from "../component/ChildComponent";
import DomEventHandler from "../DomEventHandler";
import DomHandler from "../DomHandler";
import DOMMutationHandler from "../DOMMutationHandler";
import EventHandler from "../EventHandler";

export default class LoadArenaMenu extends Component {

    public fileInputParentElt: HTMLElement;
    private element: HTMLElement;
    private loadElt: HTMLElement;
    private cancelElt: HTMLElement;
    private errorElt: HTMLElement;
    private fileNameElt: HTMLElement;
    private fileInputElt: HTMLInputElement;
    private arena: any;

    constructor(mainMenu: HTMLElement) {
        super();
        this.element = DomHandler.getElement("#sp-menu-load", mainMenu);
        this.loadElt = DomHandler.getElement("#load-opt-load", this.element);
        this.cancelElt = DomHandler.getElement("#load-opt-cancel", this.element);
        this.errorElt = DomHandler.getElement("#load-opt-error", this.element);
        this.fileNameElt = DomHandler.getElement(".menu-file-name", this.element);
        this.fileInputElt = DomHandler.getElement("#load-opt-file", this.element) as HTMLInputElement;
        this.fileInputParentElt = DomHandler.getElement(".menu-file-input", this.element);

        this.arena = undefined;
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this. onLoadClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this. onCancelClick);
        DomEventHandler.addListener(this, this.fileInputElt, "change", this.onFileChange);

        DOMMutationHandler.show(this.element);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this. onLoadClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this. onCancelClick);
        DomEventHandler.removeListener(this, this.fileInputElt, "change", this.onFileChange);

        DOMMutationHandler.setText(this.errorElt);
        DOMMutationHandler.setText(this.fileNameElt);
        DOMMutationHandler.setValue(this.fileInputElt);

        this.arena = undefined;

        DOMMutationHandler.hide(this.element);
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

    private onCancelClick(event: MouseEvent) {
        if (event.target === this.cancelElt) {
            EventHandler.callEvent(EventHandler.Event.LOADWORLDMENU_CANCEL_OPT_CLICK);
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
}
