import Component from 'Component';
import EventHandler from 'EventHandler';

import MainMenu from 'MainMenu';
import SinglePlayerWorld from 'world/CreateWorld';

class Game extends Component{
    constructor(){
        super();
        this.mainMenu = new MainMenu();
        this.singleplayerWorld = new SinglePlayerWorld();

    }
    start = () => {
        EventHandler.callEvent(EventHandler.Event.GAME_START);
        this.attachChild(this.mainMenu);

        EventHandler.addEventListener(EventHandler.Event.SPMENU_CREATE_OPT_CLICK, this.handleSpCreateOptClick);

    };
    update = (delta) => {
        EventHandler.callEvent(EventHandler.Event.GAME_ANIMATION_UPDATE, delta);
    };
    handleSpCreateOptClick = () => {
        this.detachChild(this.mainMenu);
        this.attachChild(this.singleplayerWorld);
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
    EventHandler.addEventListener(EventHandler.Event.RENDERER_RENDER_COMPLETE, (time) => {
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

