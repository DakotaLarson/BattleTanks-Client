import { PerspectiveCamera, Spherical, Vector3 } from "three";
import ChildComponent from "../../component/ChildComponent";
import DomHandler from "../../DomHandler";
import EventHandler from "../../EventHandler";
import CameraControls from "./CameraControls";

export default class Camera extends ChildComponent {

    protected camera: PerspectiveCamera;
    protected controls: CameraControls;

    protected spherical: Spherical;
    protected target: Vector3;

    constructor(camera: PerspectiveCamera) {
        super();
        this.camera = camera;

        this.spherical = new Spherical(); // Coordinates are defined in CameraControls
        this.target = new Vector3();

        this.controls = new CameraControls(this.spherical);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_RESIZE, this.onResize);

        EventHandler.addListener(this, EventHandler.Event.CAMERA_CONTROLS_UPDATE, this.onControlsUpdate);

        EventHandler.addListener(this, EventHandler.Event.CAMERA_PAN, this.onPan);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_RESIZE, this.onResize);

        EventHandler.removeListener(this, EventHandler.Event.CAMERA_CONTROLS_UPDATE, this.onControlsUpdate);

        EventHandler.removeListener(this, EventHandler.Event.CAMERA_PAN, this.onPan);
    }

    protected onControlsUpdate() {

        this.camera.position.setFromSpherical(this.spherical);
        this.camera.position.add(this.target);

        this.camera.lookAt(this.target);
    }

    protected onArenaSceneUpdate(data: any) {
        this.target = new Vector3(data.width / 2, 0, data.height / 2);

        this.controls.reset();

        this.camera.position.setFromSpherical(this.spherical);
        this.camera.position.add(this.target);

        this.camera.lookAt(this.target);
    }

    private onPan(data: any) {
        const deltaX = data.x;
        const deltaY = data.y;

        const offset = this.camera.position.clone();
        offset.sub(this.target);

        let targetDistance = offset.length();
        targetDistance *= Math.tan(this.camera.fov / 2 * Math.PI / 180);

        const yVec = new Vector3();
        const xVec = new Vector3();

        yVec.setFromMatrixColumn(this.camera.matrix, 0);
        xVec.copy(yVec);

        yVec.crossVectors(this.camera.up, yVec);
        yVec.multiplyScalar(2 * deltaY * targetDistance / DomHandler.getDisplayDimensions().height);
        this.target.add(yVec);

        xVec.multiplyScalar(-(2 * deltaX * targetDistance / DomHandler.getDisplayDimensions().height));
        this.target.add(xVec);

        this.camera.position.setFromSpherical(this.spherical);
        this.camera.position.add(this.target);

        this.camera.lookAt(this.target);
    }

    private onResize() {
        const dimensions = DomHandler.getDisplayDimensions();
        this.camera.aspect = dimensions.width / dimensions.height;
        this.camera.updateProjectionMatrix();
    }
}
