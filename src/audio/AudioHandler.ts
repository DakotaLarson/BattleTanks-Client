import {Audio as ThreeAudio} from "three";
import { AudioBuffer, AudioListener, AudioLoader} from "three";
import Component from "../component/ChildComponent";
import EventHandler from "../EventHandler";
import Options from "../Options";
import AudioType from "./AudioType";

export default class AudioHandler extends Component {

    private audioListener: AudioListener;

    private winAudioBuffer: AudioBuffer | undefined;
    private loseAudioBuffer: AudioBuffer | undefined;

    constructor(audioListener: AudioListener) {
        super();
        this.audioListener = audioListener;

        const audioLoader = new AudioLoader();
        // @ts-ignore Disregard extra arguments.
        audioLoader.load(location.pathname + "res/audio/win.wav", (buffer: AudioBuffer) => {
            this.winAudioBuffer = buffer;
        });

        // @ts-ignore Disregard extra arguments.
        audioLoader.load(location.pathname + "res/audio/lose.wav", (buffer: AudioBuffer) => {
            this.loseAudioBuffer = buffer;
        });

        /* tslint:disable */
        new Audio(location.pathname + "res/audio/menu-select.wav");
        new Audio(location.pathname + "res/audio/menu-back.wav");
        new Audio(location.pathname + "res/audio/menu-validate.wav");
        new Audio(location.pathname + "res/audio/menu-hover.wav");
        /* tslint:enable */

    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.AUDIO_REQUEST, this.onAudioRequest);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.AUDIO_REQUEST, this.onAudioRequest);
    }

    private onAudioRequest(audio: AudioType) {
        if (Options.options.volume) {
            switch (audio) {
                case AudioType.WIN:
                    this.playBuffer(this.winAudioBuffer as AudioBuffer);
                    break;
                case AudioType.LOSE:
                    this.playBuffer(this.loseAudioBuffer as AudioBuffer);
                    break;
                case AudioType.MENU_SELECT:
                    this.playElement(location.pathname + "res/audio/menu-select.wav");
                    break;
                case AudioType.MENU_RETURN:
                    this.playElement(location.pathname + "res/audio/menu-back.wav");
                    break;
                case AudioType.MENU_VALIDATE:
                    this.playElement(location.pathname + "res/audio/menu-validate.wav");
                    break;
                case AudioType.MENU_HOVER:
                    this.playElement(location.pathname + "res/audio/menu-hover.wav");
                    break;
            }
        }
    }

    private playBuffer(buffer: AudioBuffer) {
        const audio = new ThreeAudio(this.audioListener);
        audio.setVolume(Options.options.volume);
        audio.setBuffer(buffer);
        audio.play();
    }

    private playElement(path: string) {
        const audio = new Audio(path);
        audio.volume = Options.options.volume;
        audio.play();
    }
}
