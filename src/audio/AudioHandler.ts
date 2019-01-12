import {Audio as ThreeAudio} from "three";
import { AudioBuffer, AudioListener, AudioLoader} from "three";
import Component from "../component/Component";
import EventHandler from "../EventHandler";
import Globals from "../Globals";
import Options from "../Options";
import AudioType from "./AudioType";

export default class AudioHandler extends Component {

    private audioListener: AudioListener;
    private buffers: Map<string, AudioBuffer>;

    private enabled: boolean;

    constructor(audioListener: AudioListener) {
        super();
        this.audioListener = audioListener;
        const audioLoader = new AudioLoader();
        this.buffers = new Map();

        this.enabled = false;

        /* tslint:disable */
        for (const audioFile in AudioType) {
            if (audioFile.startsWith("GAME")) {
                // @ts-ignore Disregard extra arguments.
                audioLoader.load(location.pathname + AudioType[audioFile], (buffer: AudioBuffer) => {
                    this.buffers.set(audioFile, buffer);
                });
            } else {
                new Audio(location.pathname + AudioType[audioFile]);
            }
        }
        /* tslint:enable */
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.AUDIO_REQUEST, this.onAudioRequest);
        EventHandler.addListener(this, EventHandler.Event.AUDIO_ENABLED, this.onAudioEnabled);
        EventHandler.addListener(this, EventHandler.Event.AUDIO_DISABLED, this.onAudioDisabled);
        this.enabled = Globals.getGlobal(Globals.Global.AUDIO_ENABLED);
    }

    private onAudioRequest(audio: AudioType) {
        if (this.enabled && Options.options.gameVolume) {
            if (audio.startsWith("GAME")) {
                const buffer = this.buffers.get(audio);
                if (buffer) {
                    this.playBuffer(buffer);
                } else {
                    console.warn("Attempting to play buffer: " + audio);
                }
            } else {
                this.playElement(location.pathname + audio);
            }
        }
    }

    private onAudioEnabled() {
        this.enabled = true;
    }

    private onAudioDisabled() {
        this.enabled = false;
    }

    private playBuffer(buffer: AudioBuffer) {
        const audio = new ThreeAudio(this.audioListener);
        audio.setBuffer(buffer);
        audio.setVolume(Options.options.gameVolume);
        audio.play();
    }

    private playElement(path: string) {
        const audio = new Audio(path);
        audio.volume = Options.options.gameVolume;
        audio.play();
    }
}
