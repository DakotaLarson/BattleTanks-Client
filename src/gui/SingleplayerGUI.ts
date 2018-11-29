import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import ArenaCreateModeToggle from "./ArenaCreateModeToggle";
import DebugPanel from "./DebugPanel";
import FullscreenToggle from "./FullscreenToggle";

export default class GUI extends Component {

    private element: HTMLElement;
    private debugPanel: DebugPanel;
    private fullscreenToggle: FullscreenToggle;
    private arenaCreateModeToggle: ArenaCreateModeToggle;

    constructor() {
        super();
        this.element = DomHandler.getElement(".gui");
        this.debugPanel = new DebugPanel(this.element);
        this.fullscreenToggle = new FullscreenToggle(this.element);
        this.arenaCreateModeToggle = new ArenaCreateModeToggle(this.element);
    }

    public enable() {
        this.attachChild(this.debugPanel);
        this.attachChild(this.fullscreenToggle);
        this.attachChild(this.arenaCreateModeToggle);

        this.element.style.display = "block";
    }

    public disable() {
        this.detachChild(this.debugPanel);
        this.detachChild(this.fullscreenToggle);
        this.detachChild(this.arenaCreateModeToggle);

        this.element.style.display = "";
    }
}
