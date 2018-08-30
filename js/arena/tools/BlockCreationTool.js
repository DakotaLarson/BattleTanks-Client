import Component from '../../Component';
import DomHandler from '../../DomHandler';
import EventHandler from '../../EventHandler';

export default class BlockCreationTool extends Component{

    constructor(){
        super();
        this.eventToCall = undefined;
    }

    enable(){
        EventHandler.addListener(this, EventHandler.Event.DOM_MOUSEMOVE, this.onMouseMove);
        EventHandler.addListener(this, EventHandler.Event.DOM_MOUSEDOWN, this.onMouseDown);
        EventHandler.addListener(this, EventHandler.Event.DOM_MOUSEUP, this.onMouseUp);
    }

    disable(){
        EventHandler.removeListener(this, EventHandler.Event.DOM_MOUSEMOVE, this.onMouseMove);
        EventHandler.removeListener(this, EventHandler.Event.DOM_MOUSEDOWN, this.onMouseDown);
        EventHandler.removeListener(this, EventHandler.Event.DOM_MOUSEDOWN, this.onMouseUp);
    }

    onMouseMove(){
        if(this.eventToCall){
            EventHandler.callEvent(this.eventToCall);
        }
    }

    onMouseDown(event){
        if(!this.eventToCall){
            if(event.button === 0){
                this.eventToCall = EventHandler.Event.BLOCK_CREATION_TOOL_PRIMARY;
            }else if(event.button === 2){
                this.eventToCall = EventHandler.Event.BLOCK_CREATION_TOOL_SECONDARY;
            }
            EventHandler.callEvent(this.eventToCall)
        }
    }

    onMouseUp(event){
        if(this.eventToCall){
            if(this.eventToCall === EventHandler.Event.BLOCK_CREATION_TOOL_PRIMARY && event.button === 0 || this.eventToCall === EventHandler.Event.BLOCK_CREATION_TOOL_SECONDARY && event.button === 2){
                this.eventToCall = undefined;
            }
        }
    }

    updateMouseCoords(){
        let dimensions = DomHandler.getDisplayDimensions();
        let mouseCoords = DomHandler.getMouseCoordinates();
        this.mouseCoords.x = (mouseCoords.x / dimensions.width) * 2 - 1;
        this.mouseCoords.y = -(mouseCoords.y / dimensions.height) * 2 + 1;
    }
}
