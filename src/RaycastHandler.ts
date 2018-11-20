import {PerspectiveCamera, Raycaster} from "three";
import DomHandler from "./DomHandler";
import EventHandler from "./EventHandler";
import Globals from "./Globals";

const raycaster: Raycaster = new Raycaster();
let camera: PerspectiveCamera;

export default class RaycastHandler {

    public static init() {
        camera = Globals.getGlobal(Globals.Global.CAMERA);
        EventHandler.addListener(undefined, EventHandler.Event.RENDERER_RENDER_PREPARE, RaycastHandler.updateMouseCoords, EventHandler.Level.LOW);
    }

    public static getRaycaster() {
        return raycaster;
    }

    private static updateMouseCoords() {
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
}
