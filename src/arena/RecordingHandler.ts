import Component from "../component/Component";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

export default class RecordingHandler extends Component {

    private isRecording: boolean;

    private canvas: HTMLCanvasElement;
    private stream: MediaStream;
    private recorder: any;

    constructor() {
        super();

        this.canvas = DomHandler.getCanvas();
        // @ts-ignore
        this.stream = this.canvas.captureStream(24);

        this.isRecording = false;
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.GAME_STATUS_RUNNING, this.onStart);
        EventHandler.addListener(this, EventHandler.Event.GAME_STATUS_STARTING, this.onEnd);
        EventHandler.addListener(this, EventHandler.Event.GAME_STATUS_WAITING, this.onEnd);

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
        this.recorder = new MediaRecorder(this.stream, options);
        this.recorder.ondataavailable = (event: any) => {
            console.log();
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
        console.log("started");
    }

    private stopRecording() {
        this.recorder.stop();
        console.log("stopped");
    }
}
