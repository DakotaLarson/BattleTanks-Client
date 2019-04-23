import { PerspectiveCamera, Spherical, Vector3 } from "three";
import ChildComponent from "../../component/ChildComponent";
import DomHandler from "../../DomHandler";
import EventHandler from "../../EventHandler";

export default class MenuCamera extends ChildComponent {

    private static readonly CAMERA_SPEED = 0.125;
    private static readonly Y_OFFSET = 0.5;

    private camera: PerspectiveCamera;
    private tankPosition: Vector3;
    private cameraPosition: Spherical;

    constructor(camera: PerspectiveCamera) {
        super();
        this.camera = camera;
        this.tankPosition = new Vector3(2.5, 0, 2.5);
        this.cameraPosition = new Spherical();
    }

    public enable() {
        this.resetCameraPosition();
        this.camera.position.setFromSpherical(this.cameraPosition).add(this.tankPosition);

        EventHandler.addListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.onUpdate);
        EventHandler.addListener(this, EventHandler.Event.DOM_RESIZE, this.onResize);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.onUpdate);
        EventHandler.removeListener(this, EventHandler.Event.DOM_RESIZE, this.onResize);
    }

    private onUpdate(delta: number) {
        delta = Math.min(delta, 0.05);
        this.cameraPosition.theta += MenuCamera.CAMERA_SPEED * delta;
        this.camera.position.setFromSpherical(this.cameraPosition).add(this.tankPosition);
        this.camera.lookAt(this.tankPosition.clone().setY(MenuCamera.Y_OFFSET));
    }

    private resetCameraPosition() {
        this.cameraPosition = new Spherical(3, Math.PI / 2.75, Math.random() * Math.PI * 2);
    }

    private onResize() {
        const dimensions = DomHandler.getDisplayDimensions();
        this.camera.aspect = dimensions.width / dimensions.height;
        this.camera.updateProjectionMatrix();
    }
}
