import Component from "../component/Component";
import DomHandler from "../DomHandler";
import FullscreenToggle from "./FullscreenToggle";
import MuteToggleHandler from "./MuteToggleHandler";
import OptionsMenu from "./OptionsMenu";

export default class OverlayMenu extends Component {

    private element: HTMLElement;

    private muteToggleHandler: MuteToggleHandler;
    private fullscreenToggle: FullscreenToggle;
    private optionsMenu: OptionsMenu;

    constructor() {
        super();
        this.element = DomHandler.getElement(".overlay-menu");
        this.muteToggleHandler = new MuteToggleHandler(this.element);
        this.fullscreenToggle = new FullscreenToggle(this.element);
        this.optionsMenu = new OptionsMenu(this.element);
    }

    public enable() {

        this.attachComponent(this.muteToggleHandler);
        this.attachComponent(this.fullscreenToggle);
        this.attachComponent(this.optionsMenu);
        this.element.style.display = "block";
    }
}
