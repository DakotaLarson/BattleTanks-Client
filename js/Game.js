import Component from './Component';
import EventHandler from './EventHandler';

import MainMenu from './main_menu/MainMenu';
import Arena from './arena/Arena';
import MultiplayerConnection from './MultiplayerConnection';
import ConnectionScreen from './connection_screen/ConnectionScreen';
import GameStatusHandler from './GameStatusHandler';

class Game extends Component{
    constructor(){
        super();
        this.mainMenu = new MainMenu();
        this.connectionScreen = new ConnectionScreen();
        this.arena = undefined;
        this.mpConnection = undefined;
        this.gameStatusHandler = new GameStatusHandler();

    }
    start = () => {
        EventHandler.callEvent(EventHandler.Event.GAME_START);
        EventHandler.addListener(EventHandler.Event.CREATEWORLDMENU_CREATE_OPT_CLICK, this.handleCreateWorldInit);
        EventHandler.addListener(EventHandler.Event.LOADWORLDMENU_LOAD_OPT_CLICK, this.handleCreateWorldInit);
        EventHandler.addListener(EventHandler.Event.GAMEMENU_RETURN_TO_MAIN_REQUEST, this.handleReturnToMain);
        EventHandler.addListener(EventHandler.Event.MPMENU_CONNECT_OPT_CLICK, this.connectToMultiplayer);
        EventHandler.addListener(EventHandler.Event.CONNECTION_SCREEN_CANCEL, this.handleConnectionScreenCancel);
        
        this.attachChild(this.mainMenu);
    };
    update = (delta) => {
        EventHandler.callEvent(EventHandler.Event.GAME_ANIMATION_UPDATE, delta);
    };

    handleCreateWorldInit = (worldData) => {
        this.detachChild(this.mainMenu);

        this.arena = new Arena(worldData);
        this.attachChild(this.arena);
    };

    handleReturnToMain = () => {
        this.detachChild(this.arena);
        this.attachChild(this.mainMenu);
        this.arena = undefined;
    };

    connectToMultiplayer = () => {
        this.detachChild(this.mainMenu);
        this.attachChild(this.connectionScreen);
        this.mpConnection = new MultiplayerConnection();
        this.attachChild(this.mpConnection);
        this.attachChild(this.gameStatusHandler);
    };

    handleConnectionScreenCancel = () => {
        this.detachChild(this.connectionScreen);
        this.detachChild(this.mpConnection);
        this.detachChild(this.gameStatusHandler);
        this.mpConnection = undefined;
        this.attachChild(this.mainMenu)
    };
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
    EventHandler.addListener(EventHandler.Event.RENDERER_RENDER_COMPLETE, (time) => {
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
