import Component from './component/Component';
import EventHandler from './EventHandler';

import MainMenu from './main_menu/MainMenu';
import ArenaHandler from './arena/ArenaHandler';
import MultiplayerConnection from './MultiplayerConnection';
import ConnectionScreen from './connection_screen/ConnectionScreen';
import GameStatusHandler from './GameStatusHandler';
import AlertMessageHandler from './alert_message/AlertMessageHandler';
import ComponentDebugger from './component/ComponentDebugger';

class Game extends Component{

    mainMenu: MainMenu;
    connectionScreen: ConnectionScreen;
    arenaHandler: ArenaHandler;
    mpConnection: MultiplayerConnection;
    gameStatusHandler: GameStatusHandler;
    alertMessageHandler: AlertMessageHandler;

    constructor(){
        super();
        this.mainMenu = new MainMenu();
        this.connectionScreen = new ConnectionScreen();
        this.arenaHandler = new ArenaHandler();
        this.mpConnection = undefined;
        this.gameStatusHandler = new GameStatusHandler();
        this.alertMessageHandler = new AlertMessageHandler();
    }
    enable(){
        EventHandler.callEvent(EventHandler.Event.GAME_START);

        EventHandler.addListener(this, EventHandler.Event.CREATEWORLDMENU_CREATE_OPT_CLICK, this.loadSingleplayer);
        EventHandler.addListener(this, EventHandler.Event.LOADWORLDMENU_LOAD_OPT_CLICK, this.loadSingleplayer);

        EventHandler.addListener(this, EventHandler.Event.SP_GAMEMENU_RETURN_TO_MAIN_REQUEST, this.unloadSingleplayer);

        EventHandler.addListener(this, EventHandler.Event.MPMENU_JOIN_OPT_CLICK, this.connectToMultiplayer);

        EventHandler.addListener(this, EventHandler.Event.CONNECTION_SCREEN_DISCONNECT, this.disconnectFromMultiplayer);
        EventHandler.addListener(this, EventHandler.Event.MP_GAMEMENU_DISCONNECT, this.disconnectFromMultiplayer);
        EventHandler.addListener(this, EventHandler.Event.MULTIPLAYER_CONNECTION_WS_CLOSE, this.disconnectFromMultiplayer);
        
        this.attachChild(this.mainMenu);
        this.attachChild(this.alertMessageHandler);
        this.attachComponent(this.arenaHandler);
    }

    update(delta: number){
        EventHandler.callEvent(EventHandler.Event.GAME_ANIMATION_UPDATE, delta);
    }

    loadSingleplayer(){
        this.detachChild(this.mainMenu);
    }

    unloadSingleplayer(){
        this.attachChild(this.mainMenu);
    }

    connectToMultiplayer(address: string){
        this.detachChild(this.mainMenu);
        this.attachChild(this.connectionScreen);
        this.mpConnection = new MultiplayerConnection(address);
        this.attachChild(this.mpConnection);
        this.attachChild(this.gameStatusHandler);
    }

    disconnectFromMultiplayer(){
        this.detachChild(this.connectionScreen);
        this.detachChild(this.mpConnection);
        this.detachChild(this.gameStatusHandler);
        this.mpConnection = undefined;
        this.attachChild(this.mainMenu)
    }
}

(() => {

    const TICK_INTERVAL = 50; //20 ticks/second

    let game = new Game();
    game.enable();

    let prevTime = performance.now();
    let prevTickTime = performance.now();
    let latestRenderTime = 0;
    let prevDebugTime = prevTime;
    let debugRenderTime = 0;
    let debugComputeTime = 0;
    let debugFPSCount = 0;

    let update = () => {
        requestAnimationFrame(update);
        let currentTime = performance.now();
        if(currentTime - prevDebugTime > 1000){
            outputDebugData();
            prevDebugTime = currentTime;
        }

        let computeAndRenderTime = currentTime;

        let delta = (currentTime - prevTime) / 1000;

        let tickTime = currentTime - prevTickTime;
        if(tickTime > TICK_INTERVAL){
            EventHandler.callEvent(EventHandler.Event.GAME_TICK);
            prevTickTime = prevTickTime + TICK_INTERVAL;
        }

        game.update(delta);

        let currentDebugTime = performance.now();
        computeAndRenderTime = currentDebugTime - computeAndRenderTime;
        debugRenderTime += latestRenderTime;
        debugComputeTime += computeAndRenderTime - latestRenderTime;
        debugFPSCount ++;
        prevTime = currentTime;

    };
    update();
    EventHandler.addListener(this, EventHandler.Event.RENDERER_RENDER_COMPLETE, (time) => {
        latestRenderTime = time;
    });

    let outputDebugData = () => {
         let idleTime = 1000 - debugRenderTime - debugComputeTime;
         let debugData = {
             fps: debugFPSCount,
             rendering: debugRenderTime,
             computation: debugComputeTime,
             idle: idleTime
         };
         EventHandler.callEvent(EventHandler.Event.GAME_DEBUG_OUTPUT, debugData);
         debugRenderTime = debugComputeTime = debugFPSCount =0;
    };

    EventHandler.addListener(this, EventHandler.Event.DOM_KEYUP, (event) => {
        if(event.code === 'KeyP'){
            ComponentDebugger.printTable();
        }
    }, EventHandler.Level.LOW);
})();
