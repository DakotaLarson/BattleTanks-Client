import {Audio as Three_Audio} from "three";
import { AudioBuffer, AudioListener, AudioLoader} from "three";
import Audio from "../audio/Audio";
import Component from "../component/ChildComponent";
import EventHandler from "../EventHandler";
import Options from "../Options";

export default class AudioHandler extends Component {

    private audioListener: AudioListener;

    private winAudioBuffer: AudioBuffer | undefined;
    private loseAudioBuffer: AudioBuffer | undefined;

    constructor(audioListener: AudioListener) {
        super();
        this.audioListener = audioListener;

        const audioLoader = new AudioLoader();
        // @ts-ignore Disregard extra arguments.
        audioLoader.load("audio/win.wav", (buffer: AudioBuffer) => {
            this.winAudioBuffer = buffer;
        });

        // @ts-ignore Disregard extra arguments.
        audioLoader.load("audio/lose.wav", (buffer: AudioBuffer) => {
            this.loseAudioBuffer = buffer;
        });
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.AUDIO_REQUEST, this.onAudioRequest);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.AUDIO_REQUEST, this.onAudioRequest);
    }

    private onAudioRequest(audio: Audio) {
        switch (audio) {
            case Audio.WIN:
                if (this.winAudioBuffer) {
                    this.playBuffer(this.winAudioBuffer);

                }
                break;
            case Audio.LOSE:
                if (this.loseAudioBuffer) {
                    this.playBuffer(this.loseAudioBuffer);
                }
                break;
        }
    }

    private playBuffer(buffer: AudioBuffer) {
        const audio = new Three_Audio(this.audioListener);

        audio.setVolume(Options.options.volume);
        audio.setBuffer(buffer);
        audio.play();
    }
}
