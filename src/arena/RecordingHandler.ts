import { AudioContext as ThreeAudioContext, AudioListener } from "three";
import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

export default class RecordingHandler extends ChildComponent {

    private static readonly MIN_LENGTH = 5;

    private isRecording: boolean;
    private canRecord: boolean;

    private canvas: HTMLCanvasElement;
    private recorder: any;

    private audioListener: AudioListener;
    private backgroundGainNode: GainNode;

    private recordings: Blob[];

    constructor(audioListener: AudioListener, backgroundGainNode: GainNode) {
        super();

        this.canvas = DomHandler.getCanvas();
        this.isRecording = false;
        this.canRecord = false;

        this.audioListener = audioListener;
        this.backgroundGainNode = backgroundGainNode;

        this.recordings = [];
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

    public allowRecording() {
        this.canRecord = true;
    }

    private onStart() {
        if (!this.isRecording && this.canRecord) {
            this.startRecording();
            this.canRecord = false;
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

        // @ts-ignore
        if (this.canvas.captureStream && window.MediaRecorder) {
            this.recordings = [];
            const options = {
                mimeType: "video/webm",
            };
            // @ts-ignore
            const stream: MediaStream = this.canvas.captureStream(30);
            this.connectAudio(stream);
            // @ts-ignore
            this.recorder = new MediaRecorder(stream, options);
            this.recorder.ondataavailable = (event: any) => {
                this.recordings.push(event.data);
            };
            this.recorder.onstop = () => {
                if (this.recordings.length >= RecordingHandler.MIN_LENGTH) {
                    EventHandler.callEvent(EventHandler.Event.RECORDING_COMPLETE, this.recordings);
                } else {
                    this.recordings = [];
                }
            };
            this.recorder.start(1000);
        }
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
