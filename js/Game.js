import Component from 'Component';
import EventHandler from 'EventHandler';

import MainMenu from 'MainMenu';
import CreateWorld from 'CreateWorld';

class Game extends Component{
    constructor(){
        super();
        this.mainMenu = new MainMenu();
        this.world = null;

    }
    start = () => {
        EventHandler.callEvent(EventHandler.Event.GAME_START);
        this.attachChild(this.mainMenu);
        EventHandler.addListener(EventHandler.Event.CREATEWORLDMENU_CREATE_OPT_CLICK, this.handleCreateWorldInit);
        EventHandler.addListener(EventHandler.Event.LOADWORLDMENU_LOAD_OPT_CLICK, this.handleCreateWorldInit);
        EventHandler.addListener(EventHandler.Event.GAMEMENU_RETURN_TO_MAIN_REQUEST, this.handleReturnToMain);

    };
    update = (delta) => {
        EventHandler.callEvent(EventHandler.Event.GAME_ANIMATION_UPDATE, delta);
    };

    handleCreateWorldInit = (worldData) => {
        this.detachChild(this.mainMenu);

        this.world = new CreateWorld(worldData);
        this.attachChild(this.world);
    };

    handleReturnToMain = () => {
        this.detachChild(this.world);
        this.attachChild(this.mainMenu);
        this.world = null;
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

