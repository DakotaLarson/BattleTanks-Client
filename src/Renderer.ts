import {WebGLRenderer, Scene, PerspectiveCamera} from 'three';

import Component from './Component';
import EventHandler from './EventHandler';
import DomHandler from './DomHandler';

export default class Renderer extends Component{

    renderer: WebGLRenderer;
    scene: Scene;
    camera: PerspectiveCamera;

    constructor(scene: Scene, camera: PerspectiveCamera){
        super();
        this.renderer = new WebGLRenderer({
            canvas: DomHandler.getElement('#game-canvas') as HTMLCanvasElement,
            antialias: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.scene = scene;
        this.camera = camera;
        this.handleResize();

    }

    enable(){
        EventHandler.addListener(this, EventHandler.Event.DOM_RESIZE, this.handleResize, EventHandler.Level.LOW);
        EventHandler.addListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.render, EventHandler.Level.LOW);
    }

    disable(){
        EventHandler.removeListener(this, EventHandler.Event.DOM_RESIZE, this.handleResize, EventHandler.Level.LOW);
        EventHandler.removeListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.render, EventHandler.Level.LOW);
    }

    render(){
        let time = performance.now();
        EventHandler.callEvent(EventHandler.Event.RENDERER_RENDER_PREPARE);
        this.renderer.render(this.scene, this.camera);
        time = performance.now() - time;
        EventHandler.callEvent(EventHandler.Event.RENDERER_RENDER_COMPLETE, time);
    }

    handleResize(){
        let dimensions = DomHandler.getDisplayDimensions();
        this.renderer.setSize(dimensions.width, dimensions.height);
    }
}
