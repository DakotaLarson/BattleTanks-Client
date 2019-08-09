import { AudioContext as ThreeAudioContext, AudioListener } from "three";
import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

export default class RecordingHandler extends ChildComponent {

    private isRecording: boolean;

    private canvas: HTMLCanvasElement;
    private recorder: any;

    private audioListener: AudioListener;
    private backgroundGainNode: GainNode;

    constructor(audioListener: AudioListener, backgroundGainNode: GainNode) {
        super();

        this.canvas = DomHandler.getCanvas();
        this.isRecording = false;

        this.audioListener = audioListener;
        this.backgroundGainNode = backgroundGainNode;
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.GAME_STATUS_RUNNING, this.onStart);
        EventHandler.addListener(this, EventHandler.Event.GAME_STATUS_STARTING, this.onEnd);
        EventHandler.addListener(this, EventHandler.Event.GAME_STATUS_WAITING, this.onEnd);

    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.GAME_STATUS_RUNNING, this.onStart);
        EventHandler.removeListener(this, EventHandler.Event.GAME_STATUS_STARTING, this.onEnd);
        EventHandler.removeListener(this, EventHandler.Event.GAME_STATUS_WAITING, this.onEnd);
        if (this.isRecording) {
            this.stopRecording();
        }
    }

    private onStart() {
        console.log("onstart");

        if (!this.isRecording) {
            this.startRecording();
            this.isRecording = true;
        }
    }

    private onEnd() {
        if (this.isRecording) {
            this.stopRecording();

            this.isRecording = false;
        }
    }

    private startRecording() {
        const options = {
            mimeType: "video/webm",
        };
        // @ts-ignore
        const stream: MediaStream = this.canvas.captureStream(30);
        this.connectAudio(stream);
        // @ts-ignore
        this.recorder = new MediaRecorder(stream, options);
        this.recorder.ondataavailable = (event: any) => {
            const url = window.URL.createObjectURL(event.data);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = "test.webm";
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 100);
        };
        this.recorder.start();
    }

    private stopRecording() {
        if (this.recorder) {
            this.recorder.stop();
            this.recorder = undefined;
        }
    }

    private connectAudio(stream: MediaStream) {

        // @ts-ignore
        const context: AudioContext = ThreeAudioContext.getContext();
        const destination = context.createMediaStreamDestination();
        this.audioListener.getInput().connect(destination);
        this.backgroundGainNode.connect(destination);

        stream.addTrack(destination.stream.getAudioTracks()[0]);
    }
}
