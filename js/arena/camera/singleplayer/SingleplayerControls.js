import Component from '../../../Component';
import EventHandler from '../../../EventHandler';
import DomHandler from '../../../DomHandler';

import {Vector3, Spherical} from 'three';


//    Rotate - left mouse
//    Zoom - middle mouse, or mousewheel
//    Pan - right mouse or keys

const ButtonState = {
    PRIMARY: 0,
    SECONDARY: 2,
    TERTIARY: 1
};


export default class SinglePlayerControls extends Component{
    constructor(camera){
        super();
        this.camera = camera;
        
        this.target = new Vector3();

        this.spherical = new Spherical(25, Math.PI / 4, Math.PI / 3);
        this.update();

        this.state = -1;
    }

    enable = ()=> {
        EventHandler.addListener(EventHandler.Event.DOM_MOUSEDOWN, this.onMouseDown);
        EventHandler.addListener(EventHandler.Event.DOM_MOUSEUP, this.onMouseUp);
        EventHandler.addListener(EventHandler.Event.DOM_MOUSEMOVE, this.onMouseMove);
        EventHandler.addListener(EventHandler.Event.DOM_WHEEL, this.onWheel);
        EventHandler.addListener(EventHandler.Event.ARENA_SCENE_UPDATE, this.onArenaSceneUpdate);

        this.update();
    };

    disable = () => {
        EventHandler.removeListener(EventHandler.Event.DOM_MOUSEDOWN, this.onMouseDown);
        EventHandler.removeListener(EventHandler.Event.DOM_MOUSEUP, this.onMouseUp);
        EventHandler.removeListener(EventHandler.Event.DOM_MOUSEMOVE, this.onMouseMove);
        EventHandler.removeListener(EventHandler.Event.DOM_WHEEL, this.onWheel);
        EventHandler.removeListener(EventHandler.Event.ARENA_SCENE_UPDATE, this.onArenaSceneUpdate);
    };

    onMouseDown = (event) => {
        if(this.state === -1){
            switch(event.button){
                case 0:
                    this.state = ButtonState.PRIMARY;
                    break;
                case 1:
                    this.state = ButtonState.TERTIARY;
                    break;
                case 2:
                    this.state = ButtonState.SECONDARY;
                    break;
            }
        }
    };

    onMouseUp = () => {
        this.state = -1;
    };

    onMouseMove = (event) => {
        if(this.state === -1) return;
        switch(this.state){
            case ButtonState.PRIMARY:
                this.handleRotation(event.movementX, event.movementY);
                break;
            case ButtonState.SECONDARY:
                this.handlePan(event.movementX, event.movementY);
                break;
            case ButtonState.TERTIARY:
                this.handleZoom(event.movementY, false);
                break;
        }
    };

    onWheel = (event) => {
        this.handleZoom(event.deltaY, true);
    };

    handleRotation = (deltaX, deltaY) => {
         this.spherical.theta += deltaX * Math.PI /180 / 3;
         this.spherical.phi += deltaY * Math.PI / 180 / 5;
         this.spherical.phi = Math.min(Math.PI / 2 - Math.PI / 24, this.spherical.phi);
         this.update();
    };

    handlePan = (deltaX, deltaY) => {
        let offset = new Vector3();
        let position = this.camera.position;
        offset.copy(position).sub(this.target);

        let targetDistance = offset.length();
        targetDistance *= Math.tan(this.camera.fov / 2 * Math.PI / 180);

        let yVec = new Vector3();
        let xVec = new Vector3();

        yVec.setFromMatrixColumn(this.camera.matrix, 0);
        xVec.copy(yVec);

        yVec.crossVectors(this.camera.up, yVec);
        yVec.multiplyScalar(2 * deltaY * targetDistance / DomHandler.getDisplayDimensions().height);
        this.target.add(yVec);

        xVec.multiplyScalar(-(2 * deltaX * targetDistance / DomHandler.getDisplayDimensions().height));
        this.target.add(xVec);
        this.update();
    };

    handleZoom = (deltaY, isScroll) => {
        if(isScroll){
            if(deltaY > 0){
                this.spherical.radius = Math.min(this.spherical.radius + 2, 100);
            }else{
                this.spherical.radius = Math.max(this.spherical.radius - 2, 3);
            }
        }else{
            this.spherical.radius = Math.max(Math.min(this.spherical.radius + deltaY / 10, 50), 3);
        }
        this.update();
    };

    update = () => {
        this.camera.position.setFromSpherical(this.spherical.makeSafe());
        this.camera.position.add(this.target);
        this.camera.lookAt(this.target);

    }
    onArenaSceneUpdate = (data) => {
        this.target = new Vector3(data.width / 2, 0, data.height / 2);
        this.spherical = new Spherical(25, Math.PI / 4, Math.PI / 3);
        this.update();
    }
}


