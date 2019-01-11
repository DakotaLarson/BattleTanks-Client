import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import CreationToolPanel from "./CreationToolPanel";
import DebugPanel from "./DebugPanel";

export default class GUI extends Component {

    private element: HTMLElement;
    private debugPanel: DebugPanel;
    // private fullscreenToggle: FullscreenToggle;
    private buildToolPanel: CreationToolPanel;

    constructor() {
        super();
        this.element = DomHandler.getElement(".gui");
        this.debugPanel = new DebugPanel(this.element);
        // this.fullscreenToggle = new FullscreenToggle(this.element);
        this.buildToolPanel = new CreationToolPanel(this.element);
    }

    public enable() {
        this.attachChild(this.debugPanel);
        // this.attachChild(this.fullscreenToggle);
        this.attachChild(this.buildToolPanel);

        this.element.style.display = "block";
    }

    public disable() {
        this.detachChild(this.debugPanel);
        // this.detachChild(this.fullscreenToggle);
        this.detachChild(this.buildToolPanel);

        this.element.style.display = "";
    }
}
