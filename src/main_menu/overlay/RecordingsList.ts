import DomHandler from "../../DomHandler";
import EventHandler from "../../EventHandler";
import Globals from "../../Globals";
import MultiplayerConnection from "../../MultiplayerConnection";
import Utils from "../../Utils";
import Overlay from "./Overlay";

export default class RecordingsList extends Overlay {

    private static readonly TWITTER_WINDOW_HEIGHT = 270;
    private static readonly TWITTER_WINDOW_WIDTH = 700;

    private recordingContainer: HTMLElement;

    private urlsByElts: Map<HTMLElement, string>;
    private urlsByFbElts: Map<HTMLElement, string>;
    private urlsByTwElts: Map<HTMLElement, string>;

    constructor(contentQuery: string) {
        super(contentQuery);

        this.recordingContainer = DomHandler.getElement(".recordings-container", this.contentElt);

        this.urlsByElts = new Map();
        this.urlsByFbElts = new Map();
        this.urlsByTwElts = new Map();
    }

    public enable() {
        super.enable();

        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK_PRIMARY, this.onClick);
    }

    public disable() {
        super.disable();

        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK_PRIMARY, this.onClick);

        this.urlsByElts.clear();
        this.urlsByFbElts.clear();
        this.urlsByTwElts.clear();
    }

    public async updateRecordings() {
        while (this.recordingContainer.firstChild) {
            this.recordingContainer.removeChild(this.recordingContainer.firstChild);
        }

        const token = Globals.getGlobal(Globals.Global.AUTH_TOKEN);

        if (token) {

            const rawRecordings = await MultiplayerConnection.fetchJson("/recordings", {
                token,
            });

            for (const recording of rawRecordings) {
                const recordingElt = this.createRecordingElt(recording.url, recording.arena, new Date(recording.date));
                this.recordingContainer.appendChild(recordingElt);
            }
        }
    }

    private onClick(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (this.urlsByElts.has(target)) {
            Utils.copy(this.urlsByElts.get(target)!);
        } else if (this.urlsByFbElts.has(target)) {
            FB.ui({
                method: "share",
                href: this.urlsByFbElts.get(target)!,
            }, console.log);
        } else if (this.urlsByTwElts.has(target)) {
            const twUrl = "https://twitter.com/intent/tweet?url=" + encodeURIComponent(this.urlsByTwElts.get(target)!);

            const width = RecordingsList.TWITTER_WINDOW_WIDTH;
            const height = RecordingsList.TWITTER_WINDOW_HEIGHT;
            const left = screen.width / 2 - width / 2;
            const top = screen.height / 2 - height / 2;

            window.open(twUrl, "Share on Twitter", "toolbar=no, location=0, status=no, menubar=no, scrollbars=yes, width=" + width + ", height=" + height + ", top=" + top + ", left=" + left + ", resizable=1");
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

        const shareElt = document.createElement("span");
        shareElt.classList.add("btn-sml", "recording-social-link");
        shareElt.textContent = "Copy Link";

        const fbElt = document.createElement("img");
        fbElt.classList.add("recording-social");
        fbElt.src = "./res/social/facebook.svg";

        const twElt = document.createElement("img");
        twElt.classList.add("recording-social");
        twElt.src = "./res/social/twitter.svg";

        // const ytElt = document.createElement("img");
        // ytElt.classList.add("recording-social");
        // ytElt.src = "./res/social/youtube.svg";

        parentElt.appendChild(shareElt);
        parentElt.appendChild(fbElt);
        parentElt.appendChild(twElt);

        this.urlsByElts.set(shareElt, url);
        this.urlsByFbElts.set(fbElt, url);
        this.urlsByTwElts.set(twElt, url);
        // parentElt.appendChild(ytElt);

        return parentElt;
    }

}
