import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import Options from "../Options";

export default class BackgroundVolumeHandler extends ChildComponent {

    private static readonly VOLUME_ON_SRC = "./res/menu/sound_on.svg";
    private static readonly VOLUME_OFF_SRC = "./res/menu/sound_off.svg";

    private backgroundAudio: HTMLAudioElement;

    private volumeElt: HTMLImageElement;

    private disabled: boolean;

    constructor(parent: HTMLElement) {
        super();

        this.backgroundAudio = DomHandler.getElement("#mainmenu-background-audio", parent) as HTMLAudioElement;
        this.volumeElt = DomHandler.getElement(".menu-volume-control", parent) as HTMLImageElement;

        const storageValue = localStorage.getItem("menuBackgroundAudio");
        if (storageValue === null) {
            localStorage.setItem("menuBackgroundAudio", "true");
            this.disabled = false;
        } else {
            this.disabled = storageValue === "false";
        }
    }

    public enable() {
        this.backgroundAudio.currentTime = 0;
        this.backgroundAudio.volume = Options.options.menuVolume;
        if (this.disabled) {
            this.volumeElt.src = BackgroundVolumeHandler.VOLUME_OFF_SRC;
        } else {
            this.backgroundAudio.play().then(() => {
                this.volumeElt.src = BackgroundVolumeHandler.VOLUME_ON_SRC;
            }).catch(() => {
                this.volumeElt.src = BackgroundVolumeHandler.VOLUME_OFF_SRC;
            });
        }

        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onClick);
        EventHandler.addListener(this, EventHandler.Event.OPTIONS_UPDATE, this.onOptionsUpdate);
    }

    public disable() {
        this.backgroundAudio.pause();

        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onClick);
        EventHandler.removeListener(this, EventHandler.Event.OPTIONS_UPDATE, this.onOptionsUpdate);
    }

    private onClick(event: MouseEvent) {
        if (event.target === this.volumeElt) {
            if (this.backgroundAudio.paused) {
                this.backgroundAudio.play();
                localStorage.setItem("menuBackgroundAudio", "true");
                this.volumeElt.src = BackgroundVolumeHandler.VOLUME_ON_SRC;
            } else {
                this.backgroundAudio.pause();
                localStorage.setItem("menuBackgroundAudio", "false");
                this.volumeElt.src = BackgroundVolumeHandler.VOLUME_OFF_SRC;
            }
        }
    }

    private onOptionsUpdate(option: any) {
        if (option.attribute === "menuVolume") {
            this.backgroundAudio.volume = option.data;
        }
    }
}
