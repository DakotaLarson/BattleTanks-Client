import { PerspectiveCamera, Spherical, Vector3 } from "three";
import ChildComponent from "../../component/ChildComponent";
import EventHandler from "../../EventHandler";

export default class MenuCamera extends ChildComponent {

    private static readonly CAMERA_SPEED = 0.25;

    private camera: PerspectiveCamera;
    private tankPosition: Vector3;
    private cameraPosition: Spherical;
    private cameraTargetPosition: Vector3;

    constructor(camera: PerspectiveCamera) {
        super();
        this.camera = camera;
        this.tankPosition = new Vector3(2.5, 0, 2.5);
        this.cameraPosition = new Spherical();
        this.cameraTargetPosition = new Vector3();
    }

    public enable() {
        this.resetCameraPosition();
        this.camera.position.setFromSpherical(this.cameraPosition).add(this.tankPosition);
        EventHandler.addListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.onUpdate);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.onUpdate);
    }

    private onUpdate(delta: number) {
        this.cameraPosition.theta += MenuCamera.CAMERA_SPEED * delta;
        this.camera.position.setFromSpherical(this.cameraPosition).add(this.tankPosition);
        this.updateCameraTargetPosition();
        this.camera.lookAt(this.cameraTargetPosition);
    }

    private resetCameraPosition() {
        this.cameraPosition = new Spherical(3, Math.PI / 3, Math.random() * Math.PI * 2);
        this.updateCameraTargetPosition();
    }
    private updateCameraTargetPosition() {
        const targetSpherical = this.cameraPosition.clone();
        targetSpherical.radius = 1.5;
        targetSpherical.theta += Math.PI;
        this.cameraTargetPosition.setFromSpherical(targetSpherical).add(this.tankPosition);
    }
}
