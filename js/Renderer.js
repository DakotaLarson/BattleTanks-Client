import {WebGLRenderer, PCFSoftShadowMap} from 'three';

import Component from 'Component';
import EventHandler from 'EventHandler';
import DomHandler from 'DomHandler';

export default class Renderer extends Component{

    constructor(scene, camera){
        super();
        this.renderer = new WebGLRenderer({
            canvas: DomHandler.getElement('#game-canvas'),
            antialias: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        //this.renderer.shadowMap.enabled = true;
        //this.renderer.shadowMap.type = PCFSoftShadowMap;
        this.scene = scene;
        this.camera = camera;
        this.handleResize();

    }

    enable = () => {
        EventHandler.addMonitorEventListener(EventHandler.Event.DOM_RESIZE, this.handleResize);
        EventHandler.addMonitorEventListener(EventHandler.Event.GAME_ANIMATION_UPDATE, this.render);
    };

    disable = () => {
        EventHandler.removeEventListener(EventHandler.Event.DOM_RESIZE, this.handleResize);
        EventHandler.removeEventListener(EventHandler.Event.GAME_ANIMATION_UPDATE, this.render);
    };

    render = () => {
        let time = performance.now();
        EventHandler.callEvent(EventHandler.Event.RENDERER_RENDER_PREPARE);
        this.renderer.render(this.scene, this.camera);
        time = performance.now() - time;
        EventHandler.callEvent(EventHandler.Event.RENDERER_RENDER_COMPLETE, time);
    };

    handleResize = () =>{
        let dimensions = DomHandler.getDisplayDimensions();
        this.renderer.setSize(dimensions.width, dimensions.height);
    };
}
