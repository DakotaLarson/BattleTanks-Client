import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import ConnectedScreen from "./ConnectedScreen";
import ConnectingScreen from "./ConnectingScreen";
import DisconnectedScreen from "./DisconnectedScreen";
import StartingScreen from "./StartingScreen";
import WaitingScreen from "./WaitingScreen";

export default class ConnectionScreen extends ChildComponent {

    private element: HTMLElement;

    private connectedScreen: ConnectedScreen;
    private connectingScreen: ConnectingScreen;
    private disconnectedScreen: DisconnectedScreen;
    private waitingScreen: WaitingScreen;
    private startingScreen: StartingScreen;

    private hidden: boolean;
    private activeScreen: ChildComponent | undefined;

    constructor() {
        super();
        this.element = DomHandler.getElement(".connection-screen");

        this.connectedScreen = new ConnectedScreen(this.element);
        this.connectingScreen = new ConnectingScreen(this.element);
        this.disconnectedScreen = new DisconnectedScreen(this.element);
        this.waitingScreen = new WaitingScreen(this.element);
        this.startingScreen = new StartingScreen(this.element);

        this.hidden = false;
        this.activeScreen = undefined;
    }

    public enable() {

        EventHandler.addListener(this, EventHandler.Event.MULTIPLAYER_CONNECTION_WS_OPEN, this.onConnectionOpen);
        EventHandler.addListener(this, EventHandler.Event.MULTIPLAYER_CONNECTION_WS_CLOSE, this.onConnectionClose);

        EventHandler.addListener(this, EventHandler.Event.GAME_STATUS_WAITING, this.onWaitingGameStatus);
        EventHandler.addListener(this, EventHandler.Event.GAME_STATUS_STARTING, this.onStartingGameStatus);
        EventHandler.addListener(this, EventHandler.Event.GAME_STATUS_RUNNING, this.onRunningGameStatus);

        EventHandler.addListener(this, EventHandler.Event.MATCH_STATISTICS_RECEPTION, this.onStatsReception);

        this.element.style.display = "flex";
        this.showScreen(this.connectingScreen);

    }

    public disable() {

        EventHandler.removeListener(this, EventHandler.Event.MULTIPLAYER_CONNECTION_WS_OPEN, this.onConnectionOpen);
        EventHandler.removeListener(this, EventHandler.Event.MULTIPLAYER_CONNECTION_WS_CLOSE, this.onConnectionClose);

        EventHandler.removeListener(this, EventHandler.Event.GAME_STATUS_WAITING, this.onWaitingGameStatus);
        EventHandler.removeListener(this, EventHandler.Event.GAME_STATUS_STARTING, this.onStartingGameStatus);
        EventHandler.removeListener(this, EventHandler.Event.GAME_STATUS_RUNNING, this.onRunningGameStatus);

        EventHandler.removeListener(this, EventHandler.Event.MATCH_STATISTICS_RECEPTION, this.onStatsReception);

        this.element.style.display = "";
    }

    private onConnectionOpen() {
        this.showScreen(this.connectedScreen);
    }

    private onConnectionClose(event: CloseEvent) {
        console.log("Disconnected: " + event.code);
        this.showScreen(this.disconnectedScreen);
    }

    private onWaitingGameStatus() {
        this.showScreen(this.waitingScreen);
    }

    private onStartingGameStatus() {
        this.showScreen(this.startingScreen);
    }

    private onRunningGameStatus() {
        this.hide();
    }

    private onStatsReception(stats: any) {
        const elt = this.createStatisticsMarkup(stats);
        this.waitingScreen.updateStatistics(elt);
        this.startingScreen.updateStatistics(elt);
    }

    private showScreen(screen: ChildComponent) {
        if (this.hidden) {
            this.show();
        }
        if (this.activeScreen) {
            if (this.activeScreen !== screen) {
                this.detachChild(this.activeScreen);
                this.attachChild(screen);
                this.activeScreen = screen;
            }
        } else {
            this.attachChild(screen);
            this.activeScreen = screen;
        }
    }

    private hide() {
        if (this.activeScreen) {
            this.detachChild(this.activeScreen);
            this.activeScreen = undefined;
        }
        this.element.style.display = "";
        this.hidden = true;
    }

    private show() {
        this.element.style.display = "flex";
        this.hidden = false;
    }

    private createStatisticsMarkup(stats: any) {
        const parent = document.createElement("div");
        parent.appendChild(this.createStatisticsTitle());
        parent.appendChild(this.createStatisticMarkup("Status", stats.win ? "Win" : "Loss", true, true));

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
}
