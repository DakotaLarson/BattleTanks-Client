import Component from '../../Component';
import EventHandler from '../../EventHandler';

export default class GameSpawnCreationTool extends Component{

    constructor(){
        super();
    }

    enable = () => {
        EventHandler.addListener(EventHandler.Event.DOM_MOUSEUP, this.onMouseUp);
    }

    disable = () => {
        EventHandler.removeListener(EventHandler.Event.DOM_MOUSEUP, this.onMouseUp);
    }

    onMouseUp = (event) => {
        if(event.button === 0){
            EventHandler.callEvent(EventHandler.Event.GAMESPAWN_CREATION_TOOL_PRIMARY);
        }else if(event.button === 2){
            EventHandler.callEvent(EventHandler.Event.GAMESPAWN_CREATION_TOOL_SECONDARY);
        }
    };
}