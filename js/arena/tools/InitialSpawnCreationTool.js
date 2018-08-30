import Component from '../../Component';
import EventHandler from '../../EventHandler';

export default class InitialSpawnCreationTool extends Component{

    constructor(){
        super();
    }

    enable(){
        EventHandler.addListener(this, EventHandler.Event.DOM_MOUSEUP, this.onMouseUp);
    }

    disable(){
        EventHandler.removeListener(this, EventHandler.Event.DOM_MOUSEUP, this.onMouseUp);
    }

    onMouseUp(event){
        if(event.button === 0){
            EventHandler.callEvent(EventHandler.Event.INITIALSPAWN_CREATION_TOOL_PRIMARY);
        }else if(event.button === 2){
            EventHandler.callEvent(EventHandler.Event.INITIALSPAWN_CREATION_TOOL_SECONDARY);
        }
    }
}