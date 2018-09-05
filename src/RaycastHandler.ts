import {Vector2, Raycaster, PerspectiveCamera} from 'three';
import DomHandler from './DomHandler';
import EventHandler from './EventHandler';


const raycaster: Raycaster = new Raycaster();
let camera: PerspectiveCamera = undefined;

export default class RaycastHandler{

    static updateMouseCoords(){
        if(camera){
            let dimensions = DomHandler.getDisplayDimensions();
            let currentCoords = DomHandler.getMouseCoordinates();
            let mouseCoords = {
                x: (currentCoords.x / dimensions.width) * 2 - 1,
                y: -(currentCoords.y / dimensions.height) * 2 + 1
            };
            raycaster.setFromCamera(mouseCoords, camera);
        }
    }

    static updateCamera(cam: PerspectiveCamera){
        camera = cam;
    }

    static init(){
        EventHandler.addListener(undefined, EventHandler.Event.RENDERER_RENDER_PREPARE, RaycastHandler.updateMouseCoords, EventHandler.Level.LOW);
    }

    static getRaycaster(){
        return raycaster;
    }
    
}