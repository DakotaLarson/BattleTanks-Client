import {PerspectiveCamera, Scene, WebGLRenderer} from "three";

import Component from "./component/Component";
import DomHandler from "./DomHandler";
import EventHandler from "./EventHandler";

export default class Renderer extends Component {

    private renderer: WebGLRenderer;
    private scene: Scene;
    private camera: PerspectiveCamera;

    constructor(scene: Scene, camera: PerspectiveCamera) {
        super();
        this.renderer = new WebGLRenderer({
            canvas: DomHandler.getElement("#game-canvas") as HTMLCanvasElement,
            antialias: true,
            powerPreference: "high-performance",
            stencil: false,
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.scene = scene;
        this.camera = camera;

        EventHandler.addListener(this, EventHandler.Event.DOM_RESIZE, this.onResize);
        this.onResize();
        this.render();
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.render, EventHandler.Level.HIGH);
        setInterval(() => {
            this.sendDebugData();
        }, 1000);
    }

    public render() {
        let time = performance.now();
        EventHandler.callEvent(EventHandler.Event.RENDERER_RENDER_PREPARE);
        this.renderer.render(this.scene, this.camera);
        time = performance.now() - time;
        EventHandler.callEvent(EventHandler.Event.RENDERER_RENDER_COMPLETE, time);
    }

    public onResize() {
        const dimensions = DomHandler.getDisplayDimensions();
        this.renderer.setSize(dimensions.width, dimensions.height);
    }

    private sendDebugData() {
        EventHandler.callEvent(EventHandler.Event.DEBUG_RENDER, this.renderer.info.render.calls);
    }
}
