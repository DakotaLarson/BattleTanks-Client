import DomHandler from "../../DomHandler";
import Globals from "../../Globals";
import MultiplayerConnection from "../../MultiplayerConnection";
import Overlay from "./Overlay";

export default class RecordingsList extends Overlay {

    private recordingContainer: HTMLElement;

    constructor(contentQuery: string) {
        super(contentQuery);

        this.recordingContainer = DomHandler.getElement(".recordings-container", this.contentElt);
    }

    public async updateRecordings() {
        while (this.recordingContainer.firstChild) {
            this.recordingContainer.removeChild(this.recordingContainer.firstChild);
        }

        const token = Globals.getGlobal(Globals.Global.AUTH_TOKEN);

        if (token) {

            const rawRecordings = await MultiplayerConnection.fetch("/recordings", {
                token,
            });

            for (const recording of rawRecordings) {
                const recordingElt = this.createRecordingElt(recording.url, recording.arena, new Date(recording.date));
                this.recordingContainer.appendChild(recordingElt);
            }
        }
    }

    private createRecordingElt(url: string, arena: string, date: Date) {

        const parentElt = document.createElement("div");
        parentElt.classList.add("recording-child");

        const metaElt = this.createMetaElts(arena, date);
        const socialElt = this.createSocialElts(url);

        parentElt.appendChild(metaElt);
        parentElt.appendChild(socialElt);

        return parentElt;

    }

    private createMetaElts(arena: string, date: Date) {
        const parentElt = document.createElement("div");
        parentElt.classList.add("recording-child-meta");

        const arenaElt = document.createElement("div");
        arenaElt.classList.add("recording-child-arena");
        arenaElt.textContent = arena;

        const dateElt = document.createElement("div");
        dateElt.classList.add("recording-child-date");
        dateElt.textContent = date.toLocaleDateString() + " " + date.toLocaleTimeString();

        parentElt.appendChild(arenaElt);
        parentElt.appendChild(dateElt);

        return parentElt;
    }

    private createSocialElts(url: string) {
        const parentElt = document.createElement("div");
        parentElt.classList.add("recording-social-parent");

        const shareElt = document.createElement("img");
        shareElt.classList.add("recording-social", "recording-social-link");
        shareElt.src = "./res/social/copy.svg";

        const fbElt = document.createElement("img");
        fbElt.classList.add("recording-social");
        fbElt.src = "./res/social/facebook.svg";

        const twElt = document.createElement("img");
        twElt.classList.add("recording-social");
        twElt.src = "./res/social/twitter.svg";

        const ytElt = document.createElement("img");
        ytElt.classList.add("recording-social");
        ytElt.src = "./res/social/youtube.svg";

        parentElt.appendChild(shareElt);
        parentElt.appendChild(fbElt);
        parentElt.appendChild(twElt);
        parentElt.appendChild(ytElt);

        return parentElt;
    }

}
