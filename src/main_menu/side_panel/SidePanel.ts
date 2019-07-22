import ChildComponent from "../../component/ChildComponent";
import DomHandler from "../../DomHandler";
import EventHandler from "../../EventHandler";
import Globals from "../../Globals";
import RankCalculator from "../../RankCalculator";
import RankChart from "../overlay/RankChart";
import Store from "../store/Store";
import ArenaCreator from "./creator/ArenaCreator";
import PlayerFinder from "./PlayerFinder";
import PlayerStats from "./PlayerStats";

export default class SidePanel extends ChildComponent {

    private topContainer: HTMLElement;

    private store: Store;
    private playerStats: PlayerStats;
    private playerFinder: PlayerFinder;
    private arenaCreator: ArenaCreator;

    private lastAttachedChild: ChildComponent | undefined;

    private usernameElt: HTMLElement;

    private dataContainer: HTMLElement;
    private levelElt: HTMLElement;
    private rankElt: HTMLElement;

    private messageElt: HTMLElement;

    private storeBtn: HTMLElement;
    private statsBtn: HTMLElement;
    private findBtn: HTMLElement;
    private createBtn: HTMLElement;
    private rankChartBtn: HTMLElement;

    private backBtn: HTMLElement;

    private rankChart: RankChart;

    private storeVisible: boolean;

    constructor(menuElt: HTMLElement) {
        super();

        this.topContainer = DomHandler.getElement(".side-panel-top", menuElt);

        this.store = new Store(menuElt);
        this.playerStats = new PlayerStats(menuElt);
        this.playerFinder = new PlayerFinder(menuElt);
        this.arenaCreator = new ArenaCreator(menuElt);

        this.usernameElt = DomHandler.getElement(".side-panel-username", this.topContainer);

        this.dataContainer = DomHandler.getElement(".data-container", this.topContainer);
        this.levelElt = DomHandler.getElement(".side-panel-level", this.topContainer);
        this.rankElt = DomHandler.getElement(".side-panel-rank", this.topContainer);

        this.messageElt = DomHandler.getElement(".side-panel-message", this.topContainer);

        this.storeBtn = DomHandler.getElement(".side-panel-store-btn", this.topContainer);
        this.statsBtn = DomHandler.getElement(".side-panel-stats-btn", this.topContainer);
        this.findBtn = DomHandler.getElement(".side-panel-find-btn", this.topContainer);
        this.createBtn = DomHandler.getElement(".side-panel-create-btn", this.topContainer);
        this.rankChartBtn = DomHandler.getElement(".rank-tutorial-btn", this.topContainer);

        this.backBtn = DomHandler.getElement(".side-panel-back", menuElt);

        this.rankChart = new RankChart(".overlay-rank");

        this.rankChart.constructRankChart();

        this.storeVisible = false;
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.SIGN_IN, this.onSignIn);
        EventHandler.addListener(this, EventHandler.Event.SIGN_OUT, this.onSignOut);
        EventHandler.addListener(this, EventHandler.Event.USERNAME_UPDATE, this.onUsernameUpdate);

        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK_PRIMARY, this.onClick);

        EventHandler.addListener(this, EventHandler.Event.OVERLAY_CLOSE, this.onOverlayClose);

        const authToken = Globals.getGlobal(Globals.Global.AUTH_TOKEN);
        if (authToken) {
            this.onSignIn(authToken);
        } else {
            this.onSignOut();
        }

        this.attachComponent(this.store);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.SIGN_IN, this.onSignIn);
        EventHandler.removeListener(this, EventHandler.Event.SIGN_OUT, this.onSignOut);
        EventHandler.removeListener(this, EventHandler.Event.USERNAME_UPDATE, this.onUsernameUpdate);

        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK_PRIMARY, this.onClick);

        EventHandler.removeListener(this, EventHandler.Event.OVERLAY_CLOSE, this.onOverlayClose);

        this.detach();
    }

    private onSignIn(token: string) {
        this.updateStats(token);
        this.updateButtons(true);
        this.messageElt.style.display = "none";

        if (this.lastAttachedChild) {
            this.detach();
        }
    }

    private onSignOut() {
        this.updateStats();
        this.updateButtons(false);
        this.messageElt.style.display = "";

        if (this.lastAttachedChild) {
            this.detach();
        }
    }

    private onUsernameUpdate(username?: string) {
        if (username) {
            this.usernameElt.style.display = "block";
            this.usernameElt.textContent = username;
        } else {
            this.usernameElt.style.display = "";
        }
    }

    private onClick(event: MouseEvent) {
        if (event.target === this.storeBtn) {
            this.topContainer.style.display = "none";
            this.backBtn.style.display = "inline-block";

            this.store.show();
            this.storeVisible = true;
        } else if (event.target === this.statsBtn && !this.statsBtn.classList.contains("btn-disabled")) {
            this.attach(this.playerStats);
        } else if (event.target === this.findBtn) {
            this.attach(this.playerFinder);
        } else if (event.target === this.createBtn) {
            this.attach(this.arenaCreator);
        } else if (event.target === this.rankChartBtn) {
            this.attachChild(this.rankChart);
        } else if (event.target === this.backBtn) {
            this.detach();
        }
    }

    private onOverlayClose() {
        this.detachChild(this.rankChart);
    }

    private async updateStats(token?: string) {
        if (token) {
            const stats = await this.retrieveStats(token);
            const rankData = this.updateRankAndLevel(stats);
            this.store.updateStats(parseInt(rankData.level, 10), stats.currency);
            this.dataContainer.style.display = "grid";
            this.playerStats.updateStats(stats);

            this.rankChart.updateProgress(parseInt(rankData.level, 10), stats.points);
        } else {
            this.dataContainer.style.display = "";
            this.playerStats.updateStats(undefined);
            this.store.updateStats(0, 0);

            this.rankChart.updateProgress();
        }
    }

    private updateButtons(hasToken: boolean) {
        if (hasToken) {
            this.statsBtn.classList.remove("btn-disabled");
        } else {
            this.statsBtn.classList.add("btn-disabled");
        }
    }

    private updateRankAndLevel(stats: any) {
        const data = RankCalculator.getData(stats.points);
        this.rankElt.textContent = data.rank;
        this.levelElt.textContent = data.level;
        return data;
    }

    private async retrieveStats(authToken: string) {
        const address = "http" + Globals.getGlobal(Globals.Global.HOST);
        const body = JSON.stringify({
            token: authToken,
        });

        try {
            const response = await fetch(address + "/playerstats", {
                method: "post",
                mode: "cors",
                credentials: "omit",
                body,
                headers: {
                    "content-type": "application/json",
                },
            });
            return response.json();
        } catch (err) {
            console.error(err);
        }
    }

    private attach(child: ChildComponent) {
        this.attachChild(child);
        this.topContainer.style.display = "none";
        this.backBtn.style.display = "inline-block";
        this.lastAttachedChild = child;
    }

    private detach() {
        if (this.storeVisible) {
            this.store.hide();
            this.storeVisible = false;
        } else if (this.lastAttachedChild) {
            this.detachChild(this.lastAttachedChild);
            this.lastAttachedChild = undefined;
        }

        this.topContainer.style.display = "block";
        this.backBtn.style.display = "none";
    }
}
