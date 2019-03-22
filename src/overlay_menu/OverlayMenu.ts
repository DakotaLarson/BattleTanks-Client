import Component from "../component/Component";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import ConversationList from "./ConversationList";
import FullscreenToggle from "./FullscreenToggle";
import MuteToggleHandler from "./MuteToggleHandler";
import NotificationHandler from "./NotificationHandler";
import NotificationList from "./NotificationList";
import OptionsMenu from "./OptionsMenu";
import UsernameMenu from "./UsernameMenu";

export default class OverlayMenu extends Component {

    private element: HTMLElement;

    private muteToggleHandler: MuteToggleHandler;
    private fullscreenToggle: FullscreenToggle;
    private optionsMenu: OptionsMenu;
    private conversationList: ConversationList;
    private notificationList: NotificationList;
    private usernameMenu: UsernameMenu;
    private notificationHandler: NotificationHandler;

    constructor() {
        super();
        this.element = DomHandler.getElement(".overlay-menu");
        this.muteToggleHandler = new MuteToggleHandler(this.element);
        this.fullscreenToggle = new FullscreenToggle(this.element);
        this.optionsMenu = new OptionsMenu(this.element);
        this.conversationList = new ConversationList(this.element);
        this.notificationList = new NotificationList(this.element);
        this.usernameMenu = new UsernameMenu();
        this.notificationHandler = new NotificationHandler();
    }

    public enable() {

        EventHandler.addListener(this, EventHandler.Event.USERNAME_OPT_CHANGE_CLICK, this.onUsernameChangeClick);
        EventHandler.addListener(this, EventHandler.Event.USERNAME_MENU_CLOSE, this.onUsernameMenuClose);

        this.attachComponent(this.muteToggleHandler);
        this.attachComponent(this.fullscreenToggle);
        this.attachComponent(this.optionsMenu);
        this.attachComponent(this.conversationList);
        this.attachComponent(this.notificationList);
        this.attachComponent(this.notificationHandler);
        this.element.style.display = "block";
    }

    private onUsernameChangeClick() {
        this.attachChild(this.usernameMenu);
    }

    private onUsernameMenuClose() {
        this.detachChild(this.usernameMenu);
    }
}
