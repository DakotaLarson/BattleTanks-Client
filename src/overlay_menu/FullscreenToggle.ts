import Component from "../component/Component";
import DomHandler from "../DomHandler";
import DOMMutationHandler from "../DOMMutationHandler";
import EventHandler from "../EventHandler";

export default class FullscreenToggle extends Component {

    private container: HTMLElement;

    private toggleOnElt: HTMLElement;
    private toggleOffElt: HTMLElement;

    private fullscreenEnabled: boolean;

    constructor(parent: HTMLElement) {
        super();

        this.container = DomHandler.getElement(".fullscreen-toggle", parent);
        this.toggleOnElt = DomHandler.getElement("#fullscreen-toggle-on", this.container);
        this.toggleOffElt = DomHandler.getElement("#fullscreen-toggle-off", this.container);

        this.fullscreenEnabled = false;
    }

    public enable() {
        DOMMutationHandler.show(this.container);
        DOMMutationHandler.show(this.toggleOnElt);
        this.fullscreenEnabled = false;
        EventHandler.addListener(this, EventHandler.Event.DOM_GUI_MOUSEDOWN, this.onMousedown);
        EventHandler.addListener(this, EventHandler.Event.DOM_FULLSCREEN_ENABLED, this.onFullscreenEnable);
        EventHandler.addListener(this, EventHandler.Event.DOM_FULLSCREEN_DISABLED, this.onFullscreenDisable);

    }

    private onMousedown(event: MouseEvent) {
        if (event.target === this.container || this.container.contains(event.target as Node)) {
            if (this.fullscreenEnabled) {
                DomHandler.exitFullscreen();
            } else {
                DomHandler.requestFullscreen();
            }
            DomHandler.setInterference(true);
        }
    }

    private onFullscreenEnable() {
        DOMMutationHandler.hide(this.toggleOnElt);
        DOMMutationHandler.show(this.toggleOffElt);

        this.fullscreenEnabled = true;
    }

    private onFullscreenDisable() {
        DOMMutationHandler.hide(this.toggleOffElt);
        DOMMutationHandler.show(this.toggleOnElt);

        this.fullscreenEnabled = false;
    }
}
