import {PerspectiveCamera, Scene, WebGLRenderer} from "three";

import Component from "./component/ChildComponent";
import DomHandler from "./DomHandler";
import EventHandler from "./EventHandler";

export default class Renderer extends Component {

    public renderer: WebGLRenderer;
    public scene: Scene;
    public camera: PerspectiveCamera;

    constructor(scene: Scene, camera: PerspectiveCamera) {
        super();
        this.renderer = new WebGLRenderer({
            canvas: DomHandler.getElement("#game-canvas") as HTMLCanvasElement,
            antialias: true,
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.scene = scene;
        this.camera = camera;
        this.onResize();

    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_RESIZE, this.onResize);
        EventHandler.addListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.render, EventHandler.Level.HIGH);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_RESIZE, this.onResize);
        EventHandler.removeListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.render, EventHandler.Level.HIGH);
    }

    public render() {
        let time = performance.now();
        EventHandler.callEvent(EventHandler.Event.RENDERER_RENDER_PREPARE);
        this.renderer.render(this.scene, this.camera);
        time = performance.now() - time;
        EventHandler.callEvent(EventHandler.Event.RENDERER_RENDER_COMPLETE, time);
        // console.log(this.renderer.info);

        // info.memory.geometries
        // info.memory.textures
        // info.render.calls
        // info.render.triangles
    }

    public onResize() {
        const dimensions = DomHandler.getDisplayDimensions();
        this.renderer.setSize(dimensions.width, dimensions.height);
    }
}
