import Component from './Component';
import EventHandler from './EventHandler';

import MainMenu from './main_menu/MainMenu';
import ArenaHandler from './arena/ArenaHandler';
import MultiplayerConnection from './MultiplayerConnection';
import ConnectionScreen from './connection_screen/ConnectionScreen';
import GameStatusHandler from './GameStatusHandler';
import AlertMessageHandler from './alert_message/AlertMessageHandler';

class Game extends Component{
    constructor(){
        super();
        this.mainMenu = new MainMenu();
        this.connectionScreen = new ConnectionScreen();
        this.arenaHandler = new ArenaHandler();
        this.mpConnection = undefined;
        this.gameStatusHandler = new GameStatusHandler();
        this.alertMessageHandler = new AlertMessageHandler();
    }
    start(){
        EventHandler.callEvent(EventHandler.Event.GAME_START);

        EventHandler.addListener(this, EventHandler.Event.CREATEWORLDMENU_CREATE_OPT_CLICK, this.loadSingleplayer);
        EventHandler.addListener(this, EventHandler.Event.LOADWORLDMENU_LOAD_OPT_CLICK, this.loadSingleplayer);

        EventHandler.addListener(this, EventHandler.Event.SP_GAMEMENU_RETURN_TO_MAIN_REQUEST, this.unloadSingleplayer);

        EventHandler.addListener(this, EventHandler.Event.MPMENU_CONNECT_OPT_CLICK, this.connectToMultiplayer);

        EventHandler.addListener(this, EventHandler.Event.CONNECTION_SCREEN_DISCONNECT, this.disconnectFromMultiplayer);
        EventHandler.addListener(this, EventHandler.Event.MP_GAMEMENU_DISCONNECT, this.disconnectFromMultiplayer);
        
        this.attachChild(this.mainMenu);
        this.attachChild(this.alertMessageHandler);
        this.attachChild(this.arenaHandler);
    }

    update = (delta) => {
        EventHandler.callEvent(EventHandler.Event.GAME_ANIMATION_UPDATE, delta);
    }

    loadSingleplayer(){
        this.detachChild(this.mainMenu);
    }

    unloadSingleplayer(){
        this.attachChild(this.mainMenu);
    }

    connectToMultiplayer(){
        this.detachChild(this.mainMenu);
        this.attachChild(this.connectionScreen);
        this.mpConnection = new MultiplayerConnection();
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
    let game = new Game();
    game.start();


    let prevTime = performance.now();
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
})();
