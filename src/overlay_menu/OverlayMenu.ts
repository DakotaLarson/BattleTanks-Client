import Component from "../component/Component";
import DomHandler from "../DomHandler";
import BackgroundVolumeHandler from "./BackgroundVolumeHandler";
import FullscreenToggle from "./FullscreenToggle";
import OptionsMenu from "./OptionsMenu";

export default class OverlayMenu extends Component {

    private element: HTMLElement;

    private backgroundAudioHandler: BackgroundVolumeHandler;
    private fullscreenToggle: FullscreenToggle;
    private optionsMenu: OptionsMenu;

    constructor() {
        super();
        this.element = DomHandler.getElement(".overlay-menu");
        this.backgroundAudioHandler = new BackgroundVolumeHandler(this.element);
        this.fullscreenToggle = new FullscreenToggle(this.element);
        this.optionsMenu = new OptionsMenu(this.element);
    }

    public enable() {

        this.attachChild(this.backgroundAudioHandler);
        this.attachChild(this.fullscreenToggle);
        this.attachComponent(this.optionsMenu);
        this.element.style.display = "block";
    }
}
