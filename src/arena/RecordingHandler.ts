import { AudioContext as ThreeAudioContext, AudioListener } from "three";
import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import Globals from "../Globals";

export default class RecordingHandler extends ChildComponent {

    private static readonly MIN_LENGTH = 5;

    private canRecord: boolean;

    private canvas: HTMLCanvasElement;
    private recorder: any;

    private audioListener: AudioListener;
    private backgroundGainNode: GainNode;

    private recordings: Blob[];

    constructor(audioListener: AudioListener, backgroundGainNode: GainNode) {
        super();

        this.canvas = DomHandler.getCanvas();
        Globals.setGlobal(Globals.Global.IS_RECORDING, false);
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
        if (Globals.getGlobal(Globals.Global.IS_RECORDING)) {
            this.stopRecording();
        }
    }

    public allowRecording() {
        this.canRecord = true;
    }

    private onStart() {
        if (!Globals.getGlobal(Globals.Global.IS_RECORDING) && this.canRecord) {
            this.startRecording();
            this.canRecord = false;
        }
    }

    private onEnd() {
        if (Globals.getGlobal(Globals.Global.IS_RECORDING)) {
            this.stopRecording();

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
            Globals.setGlobal(Globals.Global.IS_RECORDING, true);
        } else {
            window.alert("Please use the current version of Chrome or Firefox to record a match.");
        }
    }

    private stopRecording() {
        if (this.recorder) {
            this.recorder.stop();
            this.recorder = undefined;
            Globals.setGlobal(Globals.Global.IS_RECORDING, false);
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
