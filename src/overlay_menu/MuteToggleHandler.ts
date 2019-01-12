import ChildComponent from "../component/Component";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import Globals from "../Globals";

export default class MuteToggleHandler extends ChildComponent {

    private static readonly VOLUME_ON_SRC = "./res/menu/sound_on.svg";
    private static readonly VOLUME_OFF_SRC = "./res/menu/sound_off.svg";

    private volumeElt: HTMLImageElement;

    private enabled: boolean;

    constructor(parent: HTMLElement) {
        super();

        this.volumeElt = DomHandler.getElement(".volume-mute", parent) as HTMLImageElement;

        const storageValue = localStorage.getItem("audioElabled");
        if (storageValue === null) {
            localStorage.setItem("audioElabled", "true");
            this.enabled = true;
        } else {
            this.enabled = storageValue === "true";
        }
    }

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
        if (event.target === this.volumeElt) {
            if (this.enabled) {
                localStorage.setItem("menuBackgroundAudio", "false");
                this.volumeElt.src = MuteToggleHandler.VOLUME_OFF_SRC;
                EventHandler.callEvent(EventHandler.Event.AUDIO_DISABLED);
                Globals.setGlobal(Globals.Global.AUDIO_ENABLED, false);
                this.enabled = false;
            } else {
                localStorage.setItem("menuBackgroundAudio", "true");
                this.volumeElt.src = MuteToggleHandler.VOLUME_ON_SRC;
                EventHandler.callEvent(EventHandler.Event.AUDIO_ENABLED);
                Globals.setGlobal(Globals.Global.AUDIO_ENABLED, true);
                this.enabled = true;
            }
            DomHandler.setInterference(true);
        }
    }

    private onAudioFailure() {
        this.volumeElt.src = MuteToggleHandler.VOLUME_OFF_SRC;
        Globals.setGlobal(Globals.Global.AUDIO_ENABLED, false);
        EventHandler.callEvent(EventHandler.Event.AUDIO_DISABLED);
        this.enabled = false;
    }
}
