import ChildComponent from "../component/Component";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import Globals from "../Globals";

export default class MuteToggleHandler extends ChildComponent {

    private static readonly VOLUME_ON_SRC = "./res/menu/sound_on.svg";
    private static readonly VOLUME_OFF_SRC = "./res/menu/sound_off.svg";

    private volumeElt: HTMLImageElement;
    private volumeSuggestionElt: HTMLElement;

    private suggestionTimer: number | undefined;

    private enabled: boolean;

    constructor(parent: HTMLElement) {
        super();

        this.volumeElt = DomHandler.getElement(".volume-mute", parent) as HTMLImageElement;
        this.volumeSuggestionElt = DomHandler.getElement(".volume-suggestion");

        const storageValue = localStorage.getItem("audioEnabled");
        if (storageValue === null) {
            localStorage.setItem("audioEnabled", "true");
            this.enabled = true;
        } else {
            this.enabled = storageValue === "true";
        }
    }

    // Enabled before BackgroundAudioHandler
    public enable() {
        if (this.enabled) {
            this.volumeElt.src = MuteToggleHandler.VOLUME_ON_SRC;
            Globals.setGlobal(Globals.Global.AUDIO_ENABLED, true);
        } else {
            this.volumeElt.src = MuteToggleHandler.VOLUME_OFF_SRC;
            Globals.setGlobal(Globals.Global.AUDIO_ENABLED, false);
        }

        EventHandler.addListener(this, EventHandler.Event.DOM_GUI_MOUSEDOWN, this.onMouseDown);
        EventHandler.addListener(this, EventHandler.Event.AUDIO_FAILURE, this.onAudioFailure);
    }

    private onMouseDown(event: MouseEvent) {
        if (event.target === this.volumeElt || event.target === this.volumeSuggestionElt) {
            if (this.enabled) {
                localStorage.setItem("audioEnabled", "false");
                this.volumeElt.src = MuteToggleHandler.VOLUME_OFF_SRC;
                EventHandler.callEvent(EventHandler.Event.AUDIO_DISABLED);
                Globals.setGlobal(Globals.Global.AUDIO_ENABLED, false);
                this.enabled = false;
            } else {
                localStorage.setItem("audioEnabled", "true");
                this.volumeElt.src = MuteToggleHandler.VOLUME_ON_SRC;
                EventHandler.callEvent(EventHandler.Event.AUDIO_ENABLED);
                Globals.setGlobal(Globals.Global.AUDIO_ENABLED, true);
                this.enabled = true;
            }
            DomHandler.setInterference(true);
            window.clearTimeout(this.suggestionTimer);
            this.suggestionTimer = undefined;
            this.volumeSuggestionElt.classList.remove("volume-suggestion-visible");
        }
    }

    private onAudioFailure() {
        this.volumeElt.src = MuteToggleHandler.VOLUME_OFF_SRC;
        Globals.setGlobal(Globals.Global.AUDIO_ENABLED, false);
        EventHandler.callEvent(EventHandler.Event.AUDIO_DISABLED);
        this.enabled = false;
        this.suggestionTimer = window.setTimeout(() => {
            this.volumeSuggestionElt.classList.add("volume-suggestion-visible");
            this.suggestionTimer = window.setTimeout(() => {
                this.volumeSuggestionElt.classList.remove("volume-suggestion-visible");
                this.suggestionTimer = undefined;
            }, 10000);
        }, 1500);
    }
}
