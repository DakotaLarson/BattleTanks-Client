import Component from "../component/Component";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import FullscreenToggle from "./FullscreenToggle";
import MuteToggleHandler from "./MuteToggleHandler";
import OptionsMenu from "./OptionsMenu";
import UsernameMenu from "./UsernameMenu";

export default class OverlayMenu extends Component {

    private element: HTMLElement;

    private muteToggleHandler: MuteToggleHandler;
    private fullscreenToggle: FullscreenToggle;
    private optionsMenu: OptionsMenu;
    private usernameMenu: UsernameMenu;

    constructor() {
        super();
        this.element = DomHandler.getElement(".overlay-menu");
        this.muteToggleHandler = new MuteToggleHandler(this.element);
        this.fullscreenToggle = new FullscreenToggle(this.element);
        this.optionsMenu = new OptionsMenu(this.element);
        this.usernameMenu = new UsernameMenu();
    }

    public enable() {

        EventHandler.addListener(this, EventHandler.Event.USERNAME_OPT_CHANGE_CLICK, this.onUsernameChangeClick);

        this.attachComponent(this.muteToggleHandler);
        this.attachComponent(this.fullscreenToggle);
        this.attachComponent(this.optionsMenu);
        this.element.style.display = "block";
    }

    private onUsernameChangeClick() {
        this.attachChild(this.usernameMenu);
    }
}
