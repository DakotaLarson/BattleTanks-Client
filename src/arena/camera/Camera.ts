import { PerspectiveCamera, Spherical, Vector3 } from "three";
import ChildComponent from "../../component/ChildComponent";
import DomHandler from "../../DomHandler";
import EventHandler from "../../EventHandler";

export default class Camera extends ChildComponent {
    protected static readonly DEFAULT_POSITION = new Spherical(8, Math.PI / 4, Math.PI / 3);

    protected camera: PerspectiveCamera;

    protected spherical: Spherical;
    protected target: Vector3;

    protected spectatePos: Vector3;
    protected spectateTarget: Vector3;

    constructor(camera: PerspectiveCamera) {
        super();
        this.camera = camera;

        this.spherical = Camera.DEFAULT_POSITION.clone();
        this.target = new Vector3();

        this.spectatePos = new Vector3();
        this.spectateTarget = new Vector3();
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_RESIZE, this.onResize);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_RESIZE, this.onResize);
    }

    protected onArenaSceneUpdate(data: any) {
        this.target = new Vector3(data.width / 2, 0, data.height / 2);
        if (data.spectate) {
            this.spectatePos.set(data.spectate[0], data.spectate[1], data.spectate[2]);
            this.spectateTarget.set(data.spectate[3], data.spectate[4], data.spectate[5]);
        } else {
            this.spectatePos = new Vector3();
            this.spectateTarget = new Vector3();
        }
    }

    private onResize() {
        const dimensions = DomHandler.getDisplayDimensions();
        this.camera.aspect = dimensions.width / dimensions.height;
        this.camera.updateProjectionMatrix();
    }
}
