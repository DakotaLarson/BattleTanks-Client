import Component from "./component/Component";
import EventHandler from "./EventHandler";

import AlertMessageHandler from "./alert_message/AlertMessageHandler";
import ArenaHandler from "./arena/ArenaHandler";
import ComponentDebugger from "./component/ComponentDebugger";
import ConnectionScreen from "./connection_screen/ConnectionScreen";
import GameStatusHandler from "./GameStatusHandler";
import MainMenu from "./main_menu/MainMenu";
import MultiplayerConnection from "./MultiplayerConnection";
import Options from "./Options";

class Game extends Component {

    private mainMenu: MainMenu;
    private connectionScreen: ConnectionScreen;
    private arenaHandler: ArenaHandler;
    private mpConnection: MultiplayerConnection | undefined;
    private gameStatusHandler: GameStatusHandler;
    private alertMessageHandler: AlertMessageHandler;
    private options: Options;

    constructor() {
        super();
        this.options = new Options();
        this.mainMenu = new MainMenu();
        this.connectionScreen = new ConnectionScreen();
        this.arenaHandler = new ArenaHandler();
        this.gameStatusHandler = new GameStatusHandler();
        this.alertMessageHandler = new AlertMessageHandler();
    }
    public enable() {
        EventHandler.callEvent(EventHandler.Event.GAME_START);

        EventHandler.addListener(this, EventHandler.Event.CREATEWORLDMENU_CREATE_OPT_CLICK, this.loadSingleplayer);
        EventHandler.addListener(this, EventHandler.Event.LOADWORLDMENU_LOAD_OPT_CLICK, this.loadSingleplayer);

        EventHandler.addListener(this, EventHandler.Event.SP_GAMEMENU_RETURN_TO_MAIN_REQUEST, this.unloadSingleplayer);

        EventHandler.addListener(this, EventHandler.Event.MPMENU_JOIN_OPT_CLICK, this.connectToMultiplayer);

        EventHandler.addListener(this, EventHandler.Event.CONNECTION_SCREEN_DISCONNECT, this.disconnectFromMultiplayer);
        EventHandler.addListener(this, EventHandler.Event.MP_GAMEMENU_DISCONNECT, this.disconnectFromMultiplayer);

        this.attachComponent(this.options);
        this.attachChild(this.mainMenu);
        this.attachChild(this.alertMessageHandler);
        this.attachComponent(this.arenaHandler);
    }

    public update(delta: number) {
        EventHandler.callEvent(EventHandler.Event.GAME_ANIMATION_UPDATE, delta);
    }

    private loadSingleplayer() {
        this.detachChild(this.mainMenu);
    }

    private unloadSingleplayer() {
        this.attachChild(this.mainMenu);
    }

    private connectToMultiplayer(address: string) {
        this.detachChild(this.mainMenu);
        this.attachChild(this.connectionScreen);
        this.mpConnection = new MultiplayerConnection(address);
        this.attachChild(this.mpConnection);
        this.attachChild(this.gameStatusHandler);
    }

    private disconnectFromMultiplayer() {
        this.detachChild(this.connectionScreen);
        this.detachChild(this.mpConnection as MultiplayerConnection);
        this.detachChild(this.gameStatusHandler);
        this.mpConnection = undefined;
        this.attachChild(this.mainMenu);
    }
}

(() => {

    const TICK_INTERVAL = 50; // 20 ticks/second

    const game = new Game();
    game.enable();

    let prevTime = performance.now();
    let prevTickTime = performance.now();
    let latestRenderTime = 0;
    let prevDebugTime = prevTime;
    let debugRenderTime = 0;
    let debugComputeTime = 0;
    let debugFPSCount = 0;

    const update = () => {
        requestAnimationFrame(update);
        const currentTime = performance.now();
        if (currentTime - prevDebugTime > 1000) {
            outputDebugData();
            prevDebugTime = currentTime;
        }

        let computeAndRenderTime = currentTime;

        const delta = (currentTime - prevTime) / 1000;

        const tickTime = currentTime - prevTickTime;
        if (tickTime > TICK_INTERVAL) {
            EventHandler.callEvent(EventHandler.Event.GAME_TICK);
            prevTickTime = prevTickTime + TICK_INTERVAL;
        }

        game.update(delta);

        const currentDebugTime = performance.now();
        computeAndRenderTime = currentDebugTime - computeAndRenderTime;
        debugRenderTime += latestRenderTime;
        debugComputeTime += computeAndRenderTime - latestRenderTime;
        debugFPSCount ++;
        prevTime = currentTime;

    };
    update();
    EventHandler.addListener(undefined, EventHandler.Event.RENDERER_RENDER_COMPLETE, (time) => {
        latestRenderTime = time;
    });

    const outputDebugData = () => {
         const idleTime = 1000 - debugRenderTime - debugComputeTime;
         const debugData = {
             fps: debugFPSCount,
             rendering: debugRenderTime,
             computation: debugComputeTime,
             idle: idleTime,
         };
         EventHandler.callEvent(EventHandler.Event.GAME_DEBUG_OUTPUT, debugData);
         debugRenderTime = debugComputeTime = debugFPSCount = 0;
    };

    EventHandler.addListener(undefined, EventHandler.Event.DOM_KEYUP, (event) => {
        if (event.code === "KeyP") {
            ComponentDebugger.printTable();
        }
    }, EventHandler.Level.LOW);
})();
