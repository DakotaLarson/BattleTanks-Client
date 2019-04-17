import { PerspectiveCamera } from "three";
import AlertMessageHandler from "./alert_message/AlertMessageHandler";
import ArenaHandler from "./arena/ArenaHandler";
import BatchHandler from "./arena/scene/batch/BatchHandler";
import BillboardBatchHandler from "./arena/scene/batch/BillboardBatchHandler";
import BackgroundAudioHandler from "./audio/BackgroundAudioHandler";
import Auth from "./Auth";
import Component from "./component/Component";
import ComponentDebugger from "./component/ComponentDebugger";
import ConnectionMenu from "./connection_menu/ConnectionMenu";
import ConversationViewer from "./ConversationViewer";
import DomHandler from "./DomHandler";
import DOMMutationHandler from "./DOMMutationHandler";
import EventHandler from "./EventHandler";
import GameStatusHandler from "./GameStatusHandler";
import Globals from "./Globals";
import MainMenu from "./main_menu/MainMenu";
import Metrics from "./Metrics";
import MultiplayerConnection from "./MultiplayerConnection";
import Options from "./Options";
import OverlayMenu from "./overlay_menu/OverlayMenu";
import ProfileViewer from "./ProfileViewer";

class Game extends Component {

    private static readonly TICK_INTERVAL = 50; // 20 ticks/second

    private prevTime: number;
    private prevTickTime: number;
    private prevDebugTime: number;
    private debugFPSCount: number;

    private mainMenu: MainMenu;
    private backgroundAudioHandler: BackgroundAudioHandler;
    private overlayMenu: OverlayMenu;
    private connectionMenu: ConnectionMenu;
    private arenaHandler: ArenaHandler;
    private mpConnection: MultiplayerConnection | undefined;
    private gameStatusHandler: GameStatusHandler;
    private alertMessageHandler: AlertMessageHandler;
    private options: Options;
    private auth: Auth;
    private metrics: Metrics;
    private profileViewer: ProfileViewer;
    private conversationViewer: ConversationViewer;

    private connectedToMultiplayer: boolean;

    constructor() {
        super();

        const now = performance.now();
        this.prevTime = now;
        this.prevTickTime = now;
        this.prevDebugTime = now;
        this.debugFPSCount = 0;

        BatchHandler.initialize();
        BillboardBatchHandler.initialize();
        ComponentDebugger.initialize();

        const perspectiveCamera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);
        this.auth = new Auth();
        this.options = new Options();
        this.mainMenu = new MainMenu(perspectiveCamera);
        this.backgroundAudioHandler = new BackgroundAudioHandler();
        this.overlayMenu = new OverlayMenu();
        this.connectionMenu = new ConnectionMenu();
        this.arenaHandler = new ArenaHandler(perspectiveCamera);
        this.gameStatusHandler = new GameStatusHandler();
        this.alertMessageHandler = new AlertMessageHandler();
        this.metrics = new Metrics();
        this.connectedToMultiplayer = false;
        this.profileViewer = new ProfileViewer();
        this.conversationViewer = new ConversationViewer();

    }
    public enable() {

        EventHandler.addListener(this, EventHandler.Event.CREATEWORLDMENU_CREATE_OPT_CLICK, this.loadSingleplayer);
        EventHandler.addListener(this, EventHandler.Event.LOADWORLDMENU_LOAD_OPT_CLICK, this.loadSingleplayer);

        EventHandler.addListener(this, EventHandler.Event.SP_GAMEMENU_RETURN_TO_MAIN_REQUEST, this.unloadSingleplayer);

        EventHandler.addListener(this, EventHandler.Event.MULTIPLAYER_CONNECT_REQUEST, this.connectToMultiplayer);

        EventHandler.addListener(this, EventHandler.Event.MULTIPLAYER_DISCONNECT_REQUEST, this.disconnectFromMultiplayer);

        EventHandler.addListener(this, EventHandler.Event.OPTIONS_UPDATE, this.onOptionsUpdate);
        EventHandler.addListener(this, EventHandler.Event.DOM_BEFOREUNLOAD, this.onUnload);

        if (!this.setHost()) {
            EventHandler.addListener(this, EventHandler.Event.DOM_VISIBILITYCHANGE, this.onVisibilityChange);
        }

        this.attachComponent(this.auth);
        this.attachComponent(this.options);
        this.attachComponent(this.overlayMenu);
        this.attachComponent(this.backgroundAudioHandler);
        this.attachComponent(this.arenaHandler);
        this.updateMenu(true);
        this.attachChild(this.alertMessageHandler);

        if (Options.options.metricsEnabled) {
            this.attachChild(this.metrics);
        }

        this.attachComponent(this.profileViewer);
        this.attachComponent(this.conversationViewer);

        this.hideLoadingScreen();

    }

    public update() {
        requestAnimationFrame(() => {
            this.update();
        });
        // PERFORMANCE DEBUGGING

        // Singular glitch with standard framerate.
        // if (Math.random() < 0.05) {
        //     const waitTime = Math.random() * 10 + 30;
        //     const waitStart = performance.now();
        //     while (performance.now() < waitStart + waitTime) {
        //         // do nothing
        //     }
        // }

        // Low framerate
        // const waitTime = Math.random() * 10 + 50;
        // const waitStart = performance.now();
        // while (performance.now() < waitStart + waitTime) {
        //     // do nothing
        // }
        const currentTime = performance.now();
        if (currentTime - this.prevDebugTime > 1000) {
            EventHandler.callEvent(EventHandler.Event.DEBUG_FPS, this.debugFPSCount);
            this.debugFPSCount = 0;
            this.prevDebugTime = currentTime;
        }

        const delta = (currentTime - this.prevTime) / 1000;

        EventHandler.callEvent(EventHandler.Event.GAME_ANIMATION_UPDATE, delta);

        const tickTime = currentTime - this.prevTickTime;
        if (tickTime > Game.TICK_INTERVAL) {
            EventHandler.callEvent(EventHandler.Event.GAME_TICK);
            this.prevTickTime = this.prevTickTime + Game.TICK_INTERVAL;
        }

        this.debugFPSCount ++;
        this.prevTime = currentTime;
    }

    private onOptionsUpdate(event: any) {
        if (event.attribute === "metricsEnabled" && !event.data) {
            this.detachChild(this.metrics);
        }
    }

    private onUnload() {
        if (this.connectedToMultiplayer) {
            this.detachChild(this.mpConnection as MultiplayerConnection);
        }
    }

    private loadSingleplayer() {
        this.updateMenu(false);
    }

    private unloadSingleplayer() {
        this.updateMenu(true);
    }

    private connectToMultiplayer() {
        const address = "ws" + Globals.getGlobal(Globals.Global.HOST);
        this.updateMenu(false);
        this.attachChild(this.connectionMenu);
        this.mpConnection = new MultiplayerConnection(address, Globals.getGlobal(Globals.Global.AUTH_TOKEN));
        this.attachChild(this.mpConnection);
        this.attachChild(this.gameStatusHandler);
        this.connectedToMultiplayer = true;
    }

    private disconnectFromMultiplayer() {
        this.detachChild(this.connectionMenu);
        this.detachChild(this.mpConnection as MultiplayerConnection);
        this.detachChild(this.gameStatusHandler);
        this.mpConnection = undefined;
        this.updateMenu(true);
        this.connectedToMultiplayer = false;
    }

    private hideLoadingScreen() {
        const elt = DomHandler.getElement(".loading-screen");
        DOMMutationHandler.addStyle(elt, "opacity", "0");
        DOMMutationHandler.addFutureStyle(elt, "display", "none", 1000);
    }

    private updateMenu(enable: boolean) {
        if (enable) {
            this.attachChild(this.mainMenu);
        } else {
            this.detachChild(this.mainMenu);
        }
    }

    private setHost() {
        let isLocal = true;
        let address = "://" + location.hostname + ":8000";
        const host = location.hostname;
        const prodHostname = "battletanks.app";
        const stagingHostname = "dakotalarson.github.io";
        if (host.includes(prodHostname) || host.includes(stagingHostname)) {
            address = "s://battle-tanks-server.herokuapp.com";
            isLocal = false;
        }
        Globals.setGlobal(Globals.Global.HOST, address);
        return isLocal;
    }

    private onVisibilityChange() {
        if (document.hidden && this.connectedToMultiplayer) {
            EventHandler.callEvent(EventHandler.Event.MULTIPLAYER_DISCONNECT_REQUEST);
        }
    }
}

(() => {

    const game = new Game();
    game.enable();
    requestAnimationFrame(() => {
        game.update();
    });

})();
