import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import DOMMutationHandler from "../DOMMutationHandler";
import EventHandler from "../EventHandler";
import ConnectedMenu from "./ConnectedMenu";
import ConnectingMenu from "./ConnectingMenu";
import DisconnectedMenu from "./DisconnectedMenu";
import StartingMenu from "./StartingMenu";
import VoteHandler from "./VoteHandler";
import WaitingMenu from "./WaitingMenu";

export default class ConnectionMenu extends ChildComponent {

    private element: HTMLElement;

    private connectedMenu: ConnectedMenu;
    private connectingMenu: ConnectingMenu;
    private disconnectedMenu: DisconnectedMenu;
    private startingMenu: StartingMenu;
    private waitingMenu: WaitingMenu;

    private voteHandler: VoteHandler;

    private hidden: boolean;

    private activeMenu: ChildComponent | undefined;

    constructor() {
        super();
        this.element = DomHandler.getElement(".connection-menu");

        this.connectedMenu = new ConnectedMenu(this.element);
        this.connectingMenu = new ConnectingMenu(this.element);
        this.disconnectedMenu = new DisconnectedMenu(this.element);
        this.waitingMenu = new WaitingMenu(this.element);
        this.startingMenu = new StartingMenu(this.element);

        this.voteHandler = new VoteHandler();

        this.hidden = false;

        this.activeMenu = undefined;
    }

    public enable() {

        EventHandler.addListener(this, EventHandler.Event.MULTIPLAYER_CONNECTION_WS_OPEN, this.onConnectionOpen);
        EventHandler.addListener(this, EventHandler.Event.MULTIPLAYER_CONNECTION_WS_CLOSE, this.onConnectionClose);

        EventHandler.addListener(this, EventHandler.Event.GAME_STATUS_WAITING, this.onWaitingGameStatus);
        EventHandler.addListener(this, EventHandler.Event.GAME_STATUS_STARTING, this.onStartingGameStatus);
        EventHandler.addListener(this, EventHandler.Event.GAME_STATUS_RUNNING, this.onRunningGameStatus);

        EventHandler.addListener(this, EventHandler.Event.STATISTICS_RECEPTION, this.onStatsReception);

        EventHandler.callEvent(EventHandler.Event.BACKGROUND_AUDIO_CONNECTION_MENU);

        DOMMutationHandler.show(this.element, "flex");
        this.showMenu(this.connectingMenu, false);

        this.attachChild(this.voteHandler);
    }

    public disable() {

        EventHandler.removeListener(this, EventHandler.Event.MULTIPLAYER_CONNECTION_WS_OPEN, this.onConnectionOpen);
        EventHandler.removeListener(this, EventHandler.Event.MULTIPLAYER_CONNECTION_WS_CLOSE, this.onConnectionClose);

        EventHandler.removeListener(this, EventHandler.Event.GAME_STATUS_WAITING, this.onWaitingGameStatus);
        EventHandler.removeListener(this, EventHandler.Event.GAME_STATUS_STARTING, this.onStartingGameStatus);
        EventHandler.removeListener(this, EventHandler.Event.GAME_STATUS_RUNNING, this.onRunningGameStatus);

        EventHandler.removeListener(this, EventHandler.Event.STATISTICS_RECEPTION, this.onStatsReception);

        EventHandler.callEvent(EventHandler.Event.BACKGROUND_AUDIO_MAIN_MENU);

        this.updateBackground(false);
        DOMMutationHandler.hide(this.element);

        this.detachChild(this.voteHandler);
    }

    private onConnectionOpen() {
        this.showMenu(this.connectedMenu, false);
    }

    private onConnectionClose(event: CloseEvent) {
        console.log("Disconnected: " + event.code);
        this.showMenu(this.disconnectedMenu, true);
    }

    private onWaitingGameStatus() {
        this.showMenu(this.waitingMenu, false);
    }

    private onStartingGameStatus() {
        this.showMenu(this.startingMenu, false);
    }

    private onRunningGameStatus() {
        this.hide();
    }

    private onStatsReception(stats: any) {
        const elt = this.createStatisticsMarkup(stats);
        this.waitingMenu.updateStatistics(elt);
        this.startingMenu.updateStatistics(elt);
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

    private createStatisticsMarkup(stats: any) {
        const parent = document.createElement("div");
        parent.appendChild(this.createStatisticsTitle());
        if (stats.win !== undefined) {
            parent.appendChild(this.createStatisticMarkup("Status", stats.win ? "Win" : "Loss", true, true));
        }

        parent.appendChild(this.createStatisticMarkup("Points Earned", stats.points));
        parent.appendChild(this.createStatisticMarkup("Currency Earned", stats.currency, true));

        parent.appendChild(this.createStatisticMarkup("Kills", stats.kills));
        parent.appendChild(this.createStatisticMarkup("Shots", stats.shots, true));

        parent.appendChild(this.createStatisticMarkup("K/D Ratio", this.createRatioText(stats.kills, stats.deaths, false) + " (" + stats.deaths + " deaths)"));
        parent.appendChild(this.createStatisticMarkup("Accuracy", this.createRatioText(stats.hits, stats.shots, true) + " (" + stats.hits + " hits)", true));

        parent.appendChild(this.createStatisticMarkup("Team Kills", stats.teamKills));
        parent.appendChild(this.createStatisticMarkup("Enemy Kills", stats.enemyTeamKills, true));

        parent.appendChild(this.createStatisticMarkup("Team Hits", stats.teamHits));
        parent.appendChild(this.createStatisticMarkup("Enemy Hits", stats.enemyTeamHits, true));

        parent.appendChild(this.createStatisticMarkup("Team Shots", stats.teamShots));
        parent.appendChild(this.createStatisticMarkup("Enemy Shots", stats.enemyTeamShots));
        return parent;
    }

    private createStatisticsTitle() {
        const elt = document.createElement("div");
        elt.classList.add("stats-title");
        elt.textContent = "Some stats from last match...";
        return elt;
    }

    private createStatisticMarkup(title: string, value: any, hasPadding?: boolean, isLarge?: boolean) {
        const elt = document.createElement("div");
        if (hasPadding) {
            elt.classList.add("stats-pad");
        }
        if (isLarge) {
            elt.classList.add("stats-large");
        }
        elt.textContent = title + ": " + value;
        return elt;
    }

    private createRatioText(a: number, b: number, isPercentage: boolean) {
        let num = a;
        if (b !== 0) {
            num = Math.round(a / b * 100);
        }
        if (!isPercentage) {
            if (b !== 0) {
                num /= 100;
            }
            return "" + num;
        } else {
            return num + "%";
        }
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
