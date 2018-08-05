import Component from 'Component';
import EventHandler from 'EventHandler';

export default class PlayerRotation extends Component{

    constructor(yawObject, pitchObject){
        super();

        this.yawObject = yawObject;
        this.pitchObject = pitchObject
    }

    enable = () => {
        EventHandler.addListener(EventHandler.Event.DOM_MOUSEMOVE, this.rotate);
    };

    disable = () => {
        EventHandler.removeListener(EventHandler.Event.DOM_MOUSEMOVE, this.rotate);
    };

    rotate = (event) => {
        this.yawObject.rotation.y -= event.movementX * 0.002;
        this.pitchObject.rotation.x -= event.movementY * 0.002;
        this.pitchObject.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitchObject.rotation.x));
    };
}
