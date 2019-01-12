import Component from "../component/Component";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import Globals from "../Globals";
import Options from "../Options";

export default class BackgroundAudioHandler extends Component {

    private audioElt: HTMLAudioElement;

    private enabled: boolean;
    private onMenu: boolean;

    constructor() {
        super();
        this.audioElt = DomHandler.getElement("audio") as HTMLAudioElement;
        this.enabled = false;
        this.onMenu = true;

    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.AUDIO_ENABLED, this.onAudioEnabled);
        EventHandler.addListener(this, EventHandler.Event.AUDIO_DISABLED, this.onAudioDisabled);
        EventHandler.addListener(this, EventHandler.Event.AUDIO_MENU, this.onAudioMenu);
        EventHandler.addListener(this, EventHandler.Event.AUDIO_GAME, this.onAudioGame);

        this.enabled = Globals.getGlobal(Globals.Global.AUDIO_ENABLED);
    }

    private onAudioEnabled() {
        this.enabled = true;
        if (this.onMenu) {
            this.onAudioMenu();
        } else {
            this.onAudioGame();
        }
    }

    private onAudioDisabled() {
        this.enabled = false;
        this.audioElt.pause();
    }

    private onAudioMenu() {
        if (this.enabled) {
            this.audioElt.currentTime = 0;
            this.audioElt.volume = Options.options.menuVolume;
            this.audioElt.play().catch(() => {
                EventHandler.callEvent(EventHandler.Event.AUDIO_FAILURE);
            });
        }
        this.onMenu = true;
    }

    private onAudioGame() {
        if (this.enabled) {
            this.audioElt.pause();
        }
        this.onMenu = false;
    }

}
