import Component from 'Component';
import DomHandler from 'DomHandler';
import EventHandler from 'EventHandler';

export default class DebugPanel extends Component{
    constructor(guiElement){
        super();
        this.element = DomHandler.getElement('.debug-panel', guiElement);

        this.debugFPSElement = DomHandler.getElement('#debug-fps', this.element);
        this.debugRenderingElement = DomHandler.getElement('#debug-rendering', this.element);
        this.debugComputationElement = DomHandler.getElement('#debug-computation', this.element);
        this.debugIdleElement = DomHandler.getElement('#debug-idle', this.element);
    }

    enable = () => {
        EventHandler.addEventListener(EventHandler.Event.GAME_DEBUG_OUTPUT, this.handleDebugOutput);
        this.element.style.display = 'inline-block';
    };

    disable = () => {
        EventHandler.removeEventListener(EventHandler.Event.GAME_DEBUG_OUTPUT, this.handleDebugOutput);
        this.element.style.display = '';
    };

    handleDebugOutput = (data) => {
        let renderingPercent = Math.round(data.rendering / 10);
        let renderingMS = Math.round(data.rendering);
        let computationPercent = Math.round(data.computation / 10);
        let computationMS = Math.round(data.computation);
        let idlePercent = Math.round(data.idle / 10);
        let idleMS = Math.round(data.idle);

        this.debugFPSElement.textContent = String(data.fps);
        this.debugRenderingElement.textContent = renderingPercent + '% (' + renderingMS + 'ms)';
        this.debugComputationElement.textContent = computationPercent + '% (' + computationMS + 'ms)';
        this.debugIdleElement.textContent = idlePercent + '% (' + idleMS + 'ms)';

    };
}

