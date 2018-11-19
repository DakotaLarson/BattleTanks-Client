import {Audio as ThreeAudio} from "three";
import { AudioBuffer, AudioListener, AudioLoader} from "three";
import Component from "../component/ChildComponent";
import EventHandler from "../EventHandler";
import Options from "../Options";
import AudioType from "./AudioType";

export default class AudioHandler extends Component {

    private audioListener: AudioListener;

    private buffers: Map<string, AudioBuffer>;

    constructor(audioListener: AudioListener) {
        super();
        this.audioListener = audioListener;

        const audioLoader = new AudioLoader();

        this.buffers = new Map();

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
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.AUDIO_REQUEST, this.onAudioRequest);
    }

    private onAudioRequest(audio: AudioType) {
        if (Options.options.volume) {
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

    private playBuffer(buffer: AudioBuffer) {
        const audio = new ThreeAudio(this.audioListener);
        audio.setBuffer(buffer);
        audio.setVolume(Options.options.volume);
        audio.play();
    }

    private playElement(path: string) {
        const audio = new Audio(path);
        audio.volume = Options.options.volume;
        audio.play();
    }
}
