import {Audio as Three_Audio} from "three";
import { AudioBuffer, AudioListener, AudioLoader, PerspectiveCamera} from "three";
import Audio from "../audio/Audio";
import Component from "../component/ChildComponent";
import EventHandler from "../EventHandler";
import Options from "../Options";

export default class AudioHandler extends Component {

    public camera: PerspectiveCamera;
    public audioListener: AudioListener;

    public winAudioBuffer: AudioBuffer | undefined;
    public loseAudioBuffer: AudioBuffer | undefined;

    constructor(camera: PerspectiveCamera, audioListener: AudioListener) {
        super();

        this.camera =  camera;
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

    public onAudioRequest(audio: Audio) {
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

    public playBuffer(buffer: AudioBuffer) {
        const audio = new Three_Audio(this.audioListener);

        // this.camera.add(audio);

        // audio.onEnded = () => {
        //     audio.isPlaying = false;
        //     this.camera.remove(audio);
        // }
        audio.setVolume(Options.options.volume);
        audio.setBuffer(buffer);
        audio.play();
    }
}
