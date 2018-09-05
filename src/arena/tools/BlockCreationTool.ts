import Component from '../../Component';
import EventHandler from '../../EventHandler';

export default class BlockCreationTool extends Component{
 
    eventToCall;

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

    onMouseDown(event: MouseEvent){
        if(!this.eventToCall){
            if(event.button === 0){
                this.eventToCall = EventHandler.Event.BLOCK_CREATION_TOOL_PRIMARY;
            }else if(event.button === 2){
                this.eventToCall = EventHandler.Event.BLOCK_CREATION_TOOL_SECONDARY;
            }
            EventHandler.callEvent(this.eventToCall)
        }
    }

    onMouseUp(event: MouseEvent){
        if(this.eventToCall){
            if(this.eventToCall === EventHandler.Event.BLOCK_CREATION_TOOL_PRIMARY && event.button === 0 || this.eventToCall === EventHandler.Event.BLOCK_CREATION_TOOL_SECONDARY && event.button === 2){
                this.eventToCall = undefined;
            }
        }
    }   
}
