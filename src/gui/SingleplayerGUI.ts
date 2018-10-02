import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import ArenaCreateModeToggle from "./ArenaCreateModeToggle";
import DebugPanel from "./DebugPanel";

export default class GUI extends Component {

    private element: HTMLElement;
    private debugPanel: DebugPanel;
    private createWorldModeToggle: ArenaCreateModeToggle;

    constructor() {
        super();
        this.element = DomHandler.getElement(".gui");
        this.debugPanel = new DebugPanel(this.element);
        this.createWorldModeToggle = new ArenaCreateModeToggle(this.element);
    }

    public enable() {
        this.attachChild(this.debugPanel);
        this.attachChild(this.createWorldModeToggle);

        this.element.style.display = "block";
    }

    public disable() {
        this.detachChild(this.debugPanel);
        this.detachChild(this.createWorldModeToggle);

        this.element.style.display = "";
    }
}
