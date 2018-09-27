import {PerspectiveCamera, Raycaster} from "three";
import DomHandler from "./DomHandler";
import EventHandler from "./EventHandler";

const raycaster: Raycaster = new Raycaster();
let camera: PerspectiveCamera;

export default class RaycastHandler {

    public static updateMouseCoords() {
        if (camera) {
            const dimensions = DomHandler.getDisplayDimensions();
            const currentCoords = DomHandler.getMouseCoordinates();
            const mouseCoords = {
                x: (currentCoords.x / dimensions.width) * 2 - 1,
                y: -(currentCoords.y / dimensions.height) * 2 + 1,
            };
            raycaster.setFromCamera(mouseCoords, camera);
        }
    }

    public static updateCamera(cam: PerspectiveCamera) {
        camera = cam;
    }

    public static init() {
        EventHandler.addListener(undefined, EventHandler.Event.RENDERER_RENDER_PREPARE, RaycastHandler.updateMouseCoords, EventHandler.Level.LOW);
    }

    public static getRaycaster() {
        return raycaster;
    }

    public static getCameraRotationAboutY() {
        return camera.rotation.y;
    }

}
