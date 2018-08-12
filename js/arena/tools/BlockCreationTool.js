import {Vector2, Raycaster} from 'three';

import Component from 'Component';
import DomHandler from 'DomHandler';
import EventHandler from 'EventHandler';

export default class BlockCreationTool extends Component{

    constructor(camera, floor){
        super();
        this.camera = camera;
        this.raycaster = new Raycaster();
        this.mouseCoords = new Vector2();
        this.intersect = undefined;
        this.eventToCall = undefined;
        this.floor = floor;
    }

    enable = () => {
        EventHandler.addListener(EventHandler.Event.RENDERER_RENDER_PREPARE, this.onBeforeRender);
        EventHandler.addListener(EventHandler.Event.DOM_MOUSEMOVE, this.onMouseMove);
        EventHandler.addListener(EventHandler.Event.DOM_MOUSEDOWN, this.onMouseDown);
        EventHandler.addListener(EventHandler.Event.DOM_MOUSEUP, this.onMouseUp);
    };

    disable = () => {
        EventHandler.removeListener(EventHandler.Event.RENDERER_RENDER_PREPARE, this.onBeforeRender);
        EventHandler.removeListener(EventHandler.Event.DOM_MOUSEMOVE, this.onMouseMove);
        EventHandler.removeListener(EventHandler.Event.DOM_MOUSEDOWN, this.onMouseDown);
        EventHandler.removeListener(EventHandler.Event.DOM_MOUSEDOWN, this.onMouseUp);
    };

    onBeforeRender = () => {
        this.updateMouseCoords();
        this.raycaster.setFromCamera(this.mouseCoords, this.camera);
        this.intersect = this.raycaster.intersectObject(this.floor);
    };

    onMouseMove = () => {
        if(this.intersect && this.eventToCall){
            let intersectCount = this.intersect.length;
            if(intersectCount) {
                if (intersectCount === 1) {
                    let intersectionLocation = this.intersect[0].point.setY(0);
                    EventHandler.callEvent(this.eventToCall, intersectionLocation);
                }else{
                    console.log('Multiple floor intersections detected.');
                }
            }
        }
    };

    onMouseDown = (event) => {
        if(this.intersect && !this.eventToCall){
            let intersectCount = this.intersect.length;
            if(intersectCount) {
                if (intersectCount === 1) {
                    if(event.button === 0){
                        this.eventToCall = EventHandler.Event.BLOCK_CREATION_TOOL_PRIMARY;
                    }else if(event.button === 2){
                        this.eventToCall = EventHandler.Event.BLOCK_CREATION_TOOL_SECONDARY;
                    }else{
                        this.eventToCall = undefined;
                        return;
                    }
                    let intersectionLocation = this.intersect[0].point.setY(0);
                    EventHandler.callEvent(this.eventToCall, intersectionLocation);
                }else{
                    console.log('Multiple floor intersections detected.');
                }
            }
        }
    };

    onMouseUp = (event) => {
        if(this.eventToCall){
            if(this.eventToCall === EventHandler.Event.BLOCK_CREATION_TOOL_PRIMARY && event.button === 0 || this.eventToCall === EventHandler.Event.BLOCK_CREATION_TOOL_SECONDARY && event.button === 2){
                this.eventToCall = undefined;
            }
        }
    };

    updateMouseCoords = () => {
        let dimensions = DomHandler.getDisplayDimensions();
        let mouseCoords = DomHandler.getMouseCoordinates();
        this.mouseCoords.x = (mouseCoords.x / dimensions.width) * 2 - 1;
        this.mouseCoords.y = -(mouseCoords.y / dimensions.height) * 2 + 1;
    };
}
