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

    private useMP3: boolean;

    constructor(audioListener: AudioListener) {
        super();
        this.audioListener = audioListener;
        const audioLoader = new AudioLoader();
        this.buffers = new Map();

        // @ts-ignore Safari is lagging behind.
        if (window.webkitAudioContext) {
            this.useMP3 = true;
        } else {
            this.useMP3 = false;
        }

        /* tslint:disable */
        
        for (const audioFile in AudioType) {
            if (audioFile.startsWith("GAME")) {
                // @ts-ignore Disregard extra arguments.
                audioLoader.load(this.getFullPath(audioFile), (buffer: AudioBuffer) => {
                    this.buffers.set(AudioType[audioFile], buffer);
                });
            } else {
                new Audio(this.getFullPath(audioFile));
            }
        }
        /* tslint:enable */
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.AUDIO_REQUEST, this.onAudioRequest);
    }

    private onAudioRequest(audio: AudioType) {
        if (Globals.getGlobal(Globals.Global.AUDIO_ENABLED) && Options.options.effectsVolume) {
            const buffer = this.buffers.get(audio);
            if (buffer) {
                this.playBuffer(buffer);
            } else {
                const extension = this.useMP3 ?  ".mp3" : ".ogg";
                this.playElement(location.pathname + audio + extension);
            }
        }
    }

    private playBuffer(buffer: AudioBuffer) {
        const audio = new ThreeAudio(this.audioListener);
        audio.setBuffer(buffer);
        audio.setVolume(Options.options.effectsVolume);
        audio.play();
    }

    private playElement(path: string) {
        const audio = new Audio(path);
        audio.volume = Options.options.effectsVolume;
        audio.play();
    }

    private getFullPath(audioFile: any) {
        if (this.useMP3) {
            return location.pathname + AudioType[audioFile] + ".mp3";
        } else {
            return location.pathname + AudioType[audioFile] + ".ogg";
        }
    }
}
