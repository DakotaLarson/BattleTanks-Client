import {Audio as ThreeAudio} from "three";
import { AudioBuffer, AudioListener, AudioLoader} from "three";
import Component from "../component/Component";
import EventHandler from "../EventHandler";
import Globals from "../Globals";
import Options from "../Options";
import AudioType from "./AudioType";

export default class AudioHandler extends Component {

    private audioListener: AudioListener;
    private recordingAudioListener: AudioListener;
    private buffers: Map<string, AudioBuffer>;

    private useMP3: boolean;

    constructor(audioListener: AudioListener, recordingAudioListener: AudioListener) {
        super();
        this.audioListener = audioListener;
        this.recordingAudioListener = recordingAudioListener;
        const audioLoader = new AudioLoader();
        this.buffers = new Map();

        // @ts-ignore Safari is lagging behind.
        if (window.webkitAudioContext) {
            this.useMP3 = true;
        } else {
            this.useMP3 = false;
        }

        // tslint:disable-next-line
        for (const audioFile in AudioType) {
            // @ts-ignore Disregard extra arguments.
            audioLoader.load(this.getFullPath(audioFile), (buffer: AudioBuffer) => {
                // @ts-ignore
                this.buffers.set(AudioType[audioFile], buffer);
            });
        }
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.AUDIO_PLAY, this.onAudioPlay);
    }

    private onAudioPlay(audio: AudioType) {

        const buffer = this.buffers.get(audio);

        if (buffer) {
            if (Globals.getGlobal(Globals.Global.IS_RECORDING)) {
                this.playRecordedBuffer(buffer);
            }

            if (Globals.getGlobal(Globals.Global.AUDIO_ENABLED) && Options.options.effectsVolume) {
                if (buffer) {
                    this.playBuffer(buffer);
                }
            }
        } else {
            console.warn("Unable to play audio: " + audio);
        }
    }

    private playBuffer(buffer: AudioBuffer) {
        const audio = new ThreeAudio(this.audioListener);
        audio.setBuffer(buffer);
        audio.setVolume(Options.options.effectsVolume);
        audio.play();
    }

    private playRecordedBuffer(buffer: AudioBuffer) {
        const recordedAudio = new ThreeAudio(this.recordingAudioListener);
        recordedAudio.setBuffer(buffer);
        recordedAudio.play();
    }

    private getFullPath(audioFile: any) {
        if (this.useMP3) {
            // @ts-ignore
            return location.pathname + AudioType[audioFile] + ".mp3";
        } else {
            // @ts-ignore
            return location.pathname + AudioType[audioFile] + ".ogg";
        }
    }
}
