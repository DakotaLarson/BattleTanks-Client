import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

export default class DebugPanel extends Component {

    private element: HTMLElement;
    private debugFPSElement: HTMLElement;
    private debugRenderingElement: HTMLElement;
    private debugComputationElement: HTMLElement;
    private debugIdleElement: HTMLElement;

    constructor(guiElement: HTMLElement) {
        super();
        this.element = DomHandler.getElement(".debug-panel", guiElement);

        this.debugFPSElement = DomHandler.getElement("#debug-fps", this.element);
        this.debugRenderingElement = DomHandler.getElement("#debug-rendering", this.element);
        this.debugComputationElement = DomHandler.getElement("#debug-computation", this.element);
        this.debugIdleElement = DomHandler.getElement("#debug-idle", this.element);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.GAME_DEBUG_OUTPUT, this.handleDebugOutput);
        this.element.style.display = "inline-block";
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.GAME_DEBUG_OUTPUT, this.handleDebugOutput);
        this.element.style.display = "";
    }

    private handleDebugOutput(data: any) {
        const renderingPercent = Math.round(data.rendering / 10);
        const renderingMS = Math.round(data.rendering);
        const computationPercent = Math.round(data.computation / 10);
        const computationMS = Math.round(data.computation);
        const idlePercent = Math.round(data.idle / 10);
        const idleMS = Math.round(data.idle);

        this.debugFPSElement.textContent = String(data.fps);
        this.debugRenderingElement.textContent = renderingPercent + "% (" + renderingMS + "ms)";
        this.debugComputationElement.textContent = computationPercent + "% (" + computationMS + "ms)";
        this.debugIdleElement.textContent = idlePercent + "% (" + idleMS + "ms)";
    }
}
