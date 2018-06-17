
import Component from 'Component';
import DomHandler from 'DomHandler';
import EventHandler from 'EventHandler';
import PlayerMovement from 'PlayerMovement';

export default class PlayerControls extends Component{

    constructor(scene, camera){
        super();
        this.movement = new PlayerMovement(scene, camera);
    }

    enable = () => {
        EventHandler.addEventListener(EventHandler.Event.DOM_KEYDOWN, this.onKeyDown);
        EventHandler.addEventListener(EventHandler.Event.DOM_KEYUP, this.onKeyUp);

        this.attachChild(this.movement);

        DomHandler.requestPointerLock();
    };

    disable = () => {
        EventHandler.removeEventListener(EventHandler.Event.DOM_KEYDOWN, this.onKeyDown);
        EventHandler.removeEventListener(EventHandler.Event.DOM_KEYUP, this.onKeyUp);
    };

    onKeyDown = (event) => {
        switch(event.code){
            case 'KeyW':
                this.movement.moveForward = true;
                break;
            case 'KeyA':
                this.movement.moveLeft = true;
                break;
            case 'KeyS':
                this.movement.moveBackward = true;
                break;
            case 'KeyD':
                this.movement.moveRight = true;
                break;
            case 'Space':
                this.movement.jumping = true;
                break;
            case 'ShiftLeft':
                this.movement.sprinting = true;
                break;
        }
    };

    onKeyUp = (event) => {
        switch (event.code) {
            case 'KeyW':
                this.movement.moveForward = false;
                break;
            case 'KeyA':
                this.movement.moveLeft = false;
                break;
            case 'KeyS':
                this.movement.moveBackward = false;
                break;
            case 'KeyD':
                this.movement.moveRight = false;
                break;
            case 'Space':
                this.movement.jumping = false;
                break;
            case 'ShiftLeft':
                this.movement.sprinting = false;
                break;
        }
    };
}
