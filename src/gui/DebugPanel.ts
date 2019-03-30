import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import DOMMutationHandler from "../DOMMutationHandler";
import EventHandler from "../EventHandler";
import PacketSender from "../PacketSender";

export default class DebugPanel extends Component {

    private parentElt: HTMLElement;
    private fpsElt: HTMLElement;
    private pingElt: HTMLElement;
    private renderElt: HTMLElement;

    private lastPingTime: number;
    private pingTask: number | undefined;

    constructor(guiElement: HTMLElement) {
        super();
        this.parentElt = DomHandler.getElement(".debug-panel", guiElement);

        this.fpsElt = DomHandler.getElement("#debug-fps", this.parentElt);
        this.pingElt = DomHandler.getElement("#debug-ping", this.parentElt);
        this.renderElt = DomHandler.getElement("#debug-render", this.parentElt);
        this.lastPingTime = 0;
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DEBUG_FPS, this.onDebugFPS);
        EventHandler.addListener(this, EventHandler.Event.DEBUG_RENDER, this.onDebugRender);

        EventHandler.addListener(this, EventHandler.Event.GAME_STATUS_RUNNING, this.onRunningStatus);
        EventHandler.addListener(this, EventHandler.Event.GAME_STATUS_STARTING, this.onOtherStatus);
        EventHandler.addListener(this, EventHandler.Event.GAME_STATUS_WAITING, this.onOtherStatus);
        EventHandler.addListener(this, EventHandler.Event.DEBUG_PONG, this.onPong);

        DOMMutationHandler.setText(this.fpsElt, "...");
        DOMMutationHandler.setText(this.pingElt, "...");
        DOMMutationHandler.setText(this.renderElt, "...");

        DOMMutationHandler.show(this.parentElt, "inline-block");
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DEBUG_FPS, this.onDebugFPS);
        EventHandler.removeListener(this, EventHandler.Event.DEBUG_RENDER, this.onDebugRender);

        EventHandler.removeListener(this, EventHandler.Event.GAME_STATUS_RUNNING, this.onRunningStatus);
        EventHandler.removeListener(this, EventHandler.Event.GAME_STATUS_STARTING, this.onOtherStatus);
        EventHandler.removeListener(this, EventHandler.Event.GAME_STATUS_WAITING, this.onOtherStatus);
        EventHandler.removeListener(this, EventHandler.Event.DEBUG_PONG, this.onPong);

        this.stopPingTask();

        DOMMutationHandler.hide(this.parentElt);
    }

    private onDebugFPS(fps: number) {
        DOMMutationHandler.setText(this.fpsElt, "" + fps);
    }

    private onDebugRender(calls: number) {
        DOMMutationHandler.setText(this.renderElt, "" + calls);
    }

    private onRunningStatus() {
        this.startPingTask();
    }

    private onOtherStatus() {
        this.stopPingTask();
    }

    private onPong() {
        const timeDiff = Math.round(performance.now() - this.lastPingTime);
        DOMMutationHandler.setText(this.pingElt, timeDiff + "ms");
        EventHandler.callEvent(EventHandler.Event.DEBUG_LATENCY, timeDiff);
    }

    private startPingTask() {
        this.pingTask = window.setInterval(() => {
            this.lastPingTime = performance.now();
            PacketSender.ping();
        }, 1000);
    }

    private stopPingTask() {
        window.clearInterval(this.pingTask);
    }
}
