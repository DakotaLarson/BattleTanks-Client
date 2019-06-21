import { PerspectiveCamera, Spherical, Vector3 } from "three";
import ChildComponent from "../../component/ChildComponent";
import DomHandler from "../../DomHandler";
import EventHandler from "../../EventHandler";

export default class MenuCamera extends ChildComponent {

    private static readonly STANDARD_RADIUS = 3;
    private static readonly STORE_RADIUS = 1.65;

    private static readonly CAMERA_SPEED = 0.125;

    private static readonly STANDARD_Y_OFFSET = 0.65;
    private static readonly STORE_Y_OFFSET = 0.2;

    private static readonly STANDARD_PHI = Math.PI / 2.75;
    private static readonly STORE_PHI = Math.PI / 3.65;

    private camera: PerspectiveCamera;
    private tankPosition: Vector3;
    private cameraPosition: Spherical;

    private yOffset: number;

    constructor(camera: PerspectiveCamera) {
        super();
        this.camera = camera;
        this.tankPosition = new Vector3(2.5, 0, 2.5);
        this.cameraPosition = new Spherical();
        this.yOffset = MenuCamera.STANDARD_Y_OFFSET;
    }

    public enable() {
        this.resetCameraPosition();
        this.camera.position.setFromSpherical(this.cameraPosition).add(this.tankPosition);

        EventHandler.addListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.onUpdate);
        EventHandler.addListener(this, EventHandler.Event.DOM_RESIZE, this.onResize);

        EventHandler.addListener(this, EventHandler.Event.STORE_OPEN, this.onStoreOpen);
        EventHandler.addListener(this, EventHandler.Event.STORE_CLOSE, this.onStoreClose);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.onUpdate);
        EventHandler.removeListener(this, EventHandler.Event.DOM_RESIZE, this.onResize);

        EventHandler.removeListener(this, EventHandler.Event.STORE_OPEN, this.onStoreOpen);
        EventHandler.removeListener(this, EventHandler.Event.STORE_CLOSE, this.onStoreClose);
    }

    private onUpdate(delta: number) {
        delta = Math.min(delta, 0.05);

        this.cameraPosition.theta += MenuCamera.CAMERA_SPEED * delta;
        this.camera.position.setFromSpherical(this.cameraPosition).add(this.tankPosition);
        this.camera.lookAt(this.tankPosition.clone().setY(this.yOffset));
    }

    private resetCameraPosition() {
        this.cameraPosition = new Spherical(MenuCamera.STANDARD_RADIUS, MenuCamera.STANDARD_PHI, Math.random() * Math.PI * 2);
    }

    private onResize() {
        const dimensions = DomHandler.getDisplayDimensions();
        this.camera.aspect = dimensions.width / dimensions.height;
        this.camera.updateProjectionMatrix();
    }

    private onStoreOpen() {
        this.cameraPosition.radius = MenuCamera.STORE_RADIUS;
        this.cameraPosition.phi = MenuCamera.STORE_PHI;
        this.yOffset = MenuCamera.STORE_Y_OFFSET;
    }

    private onStoreClose() {
        this.cameraPosition.radius = MenuCamera.STANDARD_RADIUS;
        this.cameraPosition.phi = MenuCamera.STANDARD_PHI;
        this.yOffset = MenuCamera.STANDARD_Y_OFFSET;
    }
}
