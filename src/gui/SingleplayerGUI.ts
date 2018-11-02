import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import ArenaCreateModeToggle from "./ArenaCreateModeToggle";
import DebugPanel from "./DebugPanel";

export default class GUI extends Component {

    private element: HTMLElement;
    private debugPanel: DebugPanel;
    private arenaCreateModeToggle: ArenaCreateModeToggle;

    constructor() {
        super();
        this.element = DomHandler.getElement(".gui");
        this.debugPanel = new DebugPanel(this.element);
        this.arenaCreateModeToggle = new ArenaCreateModeToggle(this.element);
    }

    public enable() {
        this.attachChild(this.debugPanel);
        this.attachChild(this.arenaCreateModeToggle);

        this.element.style.display = "block";
    }

    public disable() {
        this.detachChild(this.debugPanel);
        this.detachChild(this.arenaCreateModeToggle);

        this.element.style.display = "";
    }
}
