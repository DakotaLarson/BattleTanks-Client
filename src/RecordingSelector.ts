import Component from "./component/Component";
import DomHandler from "./DomHandler";
import EventHandler from "./EventHandler";
import Globals from "./Globals";
import MultiplayerConnection from "./MultiplayerConnection";

export default class RecordingSelector extends Component {

    private static readonly MIN_LENGTH = 5;
    private static readonly MAX_LENGTH = 30;

    private recordings: Blob[];
    private arenaTitle: string | undefined;

    private parentElt: HTMLElement;
    private rangeContainerElt: HTMLElement;
    private rangeElt: HTMLInputElement | undefined;

    private errorElt: HTMLElement;

    private cancelBtn: HTMLElement;
    private submitBtn: HTMLElement;
    private downloadRawBtn: HTMLElement;

    private overlayElt: HTMLElement;
    private overlayTextElt: HTMLElement;
    private overlayCloseBtn: HTMLElement;

    private closedBeforeProcessingComplete: boolean;

    constructor() {
        super();

        this.recordings = [];

        this.parentElt = DomHandler.getElement(".recording-selector");
        this.rangeContainerElt = DomHandler.getElement(".range-container", this.parentElt);

        this.errorElt = DomHandler.getElement(".error-msg", this.parentElt);

        this.cancelBtn = DomHandler.getElement(".action-cancel", this.parentElt);
        this.submitBtn = DomHandler.getElement(".action-submit", this.parentElt);
        this.downloadRawBtn = DomHandler.getElement(".download-raw", this.parentElt);

        this.overlayElt = DomHandler.getElement(".recording-overlay", this.parentElt);
        this.overlayTextElt = DomHandler.getElement(".recording-overlay-text", this.overlayElt);
        this.overlayCloseBtn = DomHandler.getElement(".recording-overlay-close", this.overlayElt);

        this.closedBeforeProcessingComplete = false;

    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.ARENA_SCENE_UPDATE, this.onArenaSceneUpdate);
        EventHandler.addListener(this, EventHandler.Event.RECORDING_COMPLETE, this.onRecordingComplete);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK_PRIMARY, this.onClick);
    }

    private onRecordingComplete(recordings: Blob[]) {
        this.recordings = recordings;
        this.createRangeElt(recordings.length);
        this.parentElt.style.display = "block";
        this.closedBeforeProcessingComplete = false;
    }

    private onClick(event: MouseEvent) {
        if (event.target === this.cancelBtn || event.target === this.overlayCloseBtn) {
            if (event.target === this.overlayCloseBtn) {
                this.closedBeforeProcessingComplete = true;
            }
            this.close();
        } else if (event.target === this.submitBtn) {
            if (this.rangeElt) {
                const rawValues = this.rangeElt.value.split(",");
                const lowValue = parseInt(rawValues[0], 10);
                const highValue = parseInt(rawValues[1], 10);

                if (highValue - lowValue < RecordingSelector.MIN_LENGTH) {
                    this.errorElt.textContent = "Recording must be at least " + RecordingSelector.MIN_LENGTH + " seconds long";
                } else  if (highValue - lowValue > RecordingSelector.MAX_LENGTH) {
                    this.errorElt.textContent = "Recording must be at most " + RecordingSelector.MAX_LENGTH + " seconds long";
                } else {
                    this.errorElt.textContent = "";
                    this.postRecording(lowValue, highValue);
                }
            }
        } else if (event.target === this.downloadRawBtn) {
            this.downloadBlob("BattleTanks Recording.webm");
        }
    }

    private onArenaSceneUpdate(arena: any) {
        this.arenaTitle = arena.title;
    }

    private createRangeElt(count: number) {
        while (this.rangeContainerElt.firstChild) {
            this.rangeContainerElt.removeChild(this.rangeContainerElt.firstChild);
        }
        this.rangeElt = document.createElement("input");
        this.rangeElt.setAttribute("type", "range");
        this.rangeElt.setAttribute("multiple", "");
        this.rangeElt.setAttribute("value", "0," + Math.min(count, RecordingSelector.MAX_LENGTH));
        this.rangeElt.setAttribute("min", "0");
        this.rangeElt.setAttribute("max", "" + count);
        this.rangeElt.setAttribute("step", "1");

        this.rangeContainerElt.appendChild(this.rangeElt);
        // @ts-ignore
        multirange(this.rangeElt);
    }

    private async postRecording(start: number, end: number) {
        const token = Globals.getGlobal(Globals.Global.AUTH_TOKEN);
        if (token) {
            const recording = new Blob(this.recordings, {
                type: "video/webm",
            });

            const formData = new FormData();
            formData.append("start", "" + start);
            formData.append("end", "" + end);
            formData.append("arena", this.arenaTitle!);
            formData.append("token", token);

            formData.append("recording", recording);

            this.showOverlay("Uploading...", false);

            const response = await MultiplayerConnection.fetch("/recordings", formData, "post", true);
            const reader = response.body!.getReader();

            let done = false;
            while (!done) {
                const result = await reader.read();
                done = result.done;

                if (result.value) {
                    const parsedValue = String.fromCharCode.apply(undefined, Array.from(result.value));

                    if (parsedValue === "processing") {
                        this.showOverlay("Processing...", true);
                    } else if (parsedValue === "success") {
                        if (!this.closedBeforeProcessingComplete) {
                            this.close();
                            EventHandler.callEvent(EventHandler.Event.RECORDING_PROCESSING_COMPLETE);
                        }
                    } else if (parsedValue === "failure") {
                        this.overlayElt.style.display = "";
                        window.alert("Error processing recording");
                    }
                }
            }
        }

        this.recordings = [];
    }

    private downloadBlob(title: string) {
        const recording = new Blob(this.recordings, {
            type: "video/webm",
        });
        const objectUrl = URL.createObjectURL(recording);
        const anchor = document.createElement("a");
        anchor.download = title;
        anchor.href = objectUrl;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(objectUrl);
    }

    private showOverlay(text: string, canClose: boolean) {
        this.overlayTextElt.textContent = text;
        this.overlayCloseBtn.style.display = canClose ? "" : "none";
        this.overlayElt.style.display = "block";
    }

    private close() {
        this.errorElt.textContent = "";
        this.recordings = [];
        this.parentElt.style.display = "";

        this.overlayTextElt.textContent = "";
        this.overlayElt.style.display = "";
    }
}
