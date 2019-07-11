import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import DOMMutationHandler from "../DOMMutationHandler";
import EventHandler from "../EventHandler";
import ConnectedMenu from "./ConnectedMenu";
import ConnectingMenu from "./ConnectingMenu";
import DisconnectedMenu from "./DisconnectedMenu";
import StatisticsHandler from "./StatisticsHandler";
import VoteHandler from "./VoteHandler";
import VotingMenu from "./VotingMenu";

export default class ConnectionMenu extends ChildComponent {

    private element: HTMLElement;

    private connectedMenu: ConnectedMenu;
    private connectingMenu: ConnectingMenu;
    private disconnectedMenu: DisconnectedMenu;
    private votingMenu: VotingMenu;

    private voteHandler: VoteHandler;
    private statisticsHandler: StatisticsHandler;

    private hidden: boolean;

    private activeMenu: ChildComponent | undefined;

    constructor() {
        super();
        this.element = DomHandler.getElement(".connection-menu");

        this.connectedMenu = new ConnectedMenu(this.element);
        this.connectingMenu = new ConnectingMenu(this.element);
        this.disconnectedMenu = new DisconnectedMenu(this.element);
        this.votingMenu = new VotingMenu(this.element);

        this.voteHandler = new VoteHandler(this.element);
        this.statisticsHandler = new StatisticsHandler(this.element);

        this.hidden = false;

        this.activeMenu = undefined;
    }

    public enable() {

        EventHandler.addListener(this, EventHandler.Event.MULTIPLAYER_CONNECTION_WS_OPEN, this.onConnectionOpen);
        EventHandler.addListener(this, EventHandler.Event.MULTIPLAYER_CONNECTION_WS_CLOSE, this.onConnectionClose);

        EventHandler.addListener(this, EventHandler.Event.GAME_STATUS_WAITING, this.onWaitingGameStatus);
        EventHandler.addListener(this, EventHandler.Event.GAME_STATUS_STARTING, this.onStartingGameStatus);
        EventHandler.addListener(this, EventHandler.Event.GAME_STATUS_RUNNING, this.onRunningGameStatus);

        EventHandler.callEvent(EventHandler.Event.BACKGROUND_AUDIO_CONNECTION_MENU);

        DOMMutationHandler.show(this.element, "flex");
        this.showMenu(this.connectingMenu, false);

        this.attachChild(this.voteHandler);
        this.attachChild(this.statisticsHandler);
    }

    public disable() {

        EventHandler.removeListener(this, EventHandler.Event.MULTIPLAYER_CONNECTION_WS_OPEN, this.onConnectionOpen);
        EventHandler.removeListener(this, EventHandler.Event.MULTIPLAYER_CONNECTION_WS_CLOSE, this.onConnectionClose);

        EventHandler.removeListener(this, EventHandler.Event.GAME_STATUS_WAITING, this.onWaitingGameStatus);
        EventHandler.removeListener(this, EventHandler.Event.GAME_STATUS_STARTING, this.onStartingGameStatus);
        EventHandler.removeListener(this, EventHandler.Event.GAME_STATUS_RUNNING, this.onRunningGameStatus);

        EventHandler.callEvent(EventHandler.Event.BACKGROUND_AUDIO_MAIN_MENU);

        this.updateBackground(false);
        DOMMutationHandler.hide(this.element);

        this.detachChild(this.voteHandler);
        this.detachChild(this.statisticsHandler);
    }

    private onConnectionOpen() {
        this.showMenu(this.connectedMenu, false);
    }

    private onConnectionClose(event: CloseEvent) {
        console.log("Disconnected: " + event.code);
        this.showMenu(this.disconnectedMenu, true);
    }

    private onWaitingGameStatus() {
        this.votingMenu.updateMessage(false);
        this.showMenu(this.votingMenu, false);
    }

    private onStartingGameStatus() {
        this.votingMenu.updateMessage(true);
        this.showMenu(this.votingMenu, false);
    }

    private onRunningGameStatus() {
        this.hide();
    }

    private showMenu(Menu: ChildComponent, forceBackground: boolean) {
        if (this.hidden) {
            this.show();
            EventHandler.callEvent(EventHandler.Event.BACKGROUND_AUDIO_CONNECTION_MENU);
        }
        if (this.activeMenu) {
            if (this.activeMenu !== Menu) {
                this.detachChild(this.activeMenu);
                this.attachChild(Menu);
                this.activeMenu = Menu;
            }
        } else {
            this.attachChild(Menu);
            this.activeMenu = Menu;
        }
        if (forceBackground) {
            this.updateBackground(false);
        }
    }

    private hide() {
        if (this.activeMenu) {
            this.detachChild(this.activeMenu);
            this.activeMenu = undefined;
        }
        EventHandler.callEvent(EventHandler.Event.CONNECTION_MENU_VISIBILITY_UPDATE, false);
        DOMMutationHandler.hide(this.element);
        this.updateBackground(true);
        this.hidden = true;
    }

    private show() {
        EventHandler.callEvent(EventHandler.Event.CONNECTION_MENU_VISIBILITY_UPDATE, true);
        DOMMutationHandler.show(this.element, "flex");
        this.hidden = false;
    }

    private updateBackground(hidden: boolean) {
        const menuSections = Array.from(DomHandler.getElements(".connection-menu-section", this.element));

        if (hidden) {
            DOMMutationHandler.addStyle(this.element, "background", "none");

            for (const section of menuSections) {
                DOMMutationHandler.addStyle(section, "background", "rgba(0, 0, 0, 0.75)");
            }
        } else {
            DOMMutationHandler.removeStyle(this.element, "background");

            for (const section of menuSections) {
                DOMMutationHandler.removeStyle(section, "background");
            }
        }
    }
}
