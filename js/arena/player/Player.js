import Component from '../../Component';
import EventHandler from '../../EventHandler';

const PLAYER_MOVEMENT_SPEED = 3;
const PLAYER_ROTATION_SPEED = 2;

export default class Player extends Component{

    constructor(id, pos){
        super();
        this.id = id;

        this.position = pos;
        this.bodyRotation = 0;
        this.headRotation = 0;

        this.movingForward = false;
        this.movingBackward = false;

        this.rotatingLeft = false;
        this.rotatingRight = false;
    }

    enable(){
        EventHandler.addListener(this, EventHandler.Event.DOM_KEYDOWN, this.onKeyDown);
        EventHandler.addListener(this, EventHandler.Event.DOM_KEYUP, this.onKeyUp);
        EventHandler.addListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.onUpdate);
    }

    disable(){
        EventHandler.removeListener(this, EventHandler.Event.DOM_KEYDOWN, this.onKeyDown);
        EventHandler.removeListener(this, EventHandler.Event.DOM_KEYUP, this.onKeyUp);
        EventHandler.removeListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.onUpdate);
    }

    onKeyDown(event){
        if(event.code === 'KeyW'){
            if(!this.movingBackward){
                this.movingForward = true;
            }
        }else if(event.code === 'KeyS'){
            if(!this.movingForward){
                this.movingBackward = true;
            }
        }

        if(event.code === 'KeyA'){
            if(!this.rotatingRight){
                this.rotatingLeft = true;
            }
        }else if(event.code === 'KeyD'){
            if(!this.rotatingLeft){
                this.rotatingRight = true;
            }
        }
    }

    onKeyUp(event){
        if(event.code === 'KeyW'){
            this.movingForward = false;
        }else if(event.code === 'KeyS'){
            this.movingBackward = false;
        }

        if(event.code === 'KeyA'){
            this.rotatingLeft = false;
        }else if(event.code === 'KeyD'){
            this.rotatingRight = false;
        }
    }

    onUpdate(delta){
        if(!this.movingForward && !this.movingBackward && !this.rotatingLeft && !this.rotatingRight){
            return;
        }

        let movementSpeed = 0;
        let rotationSpeed = 0;

        if(this.movingForward){
            movementSpeed = PLAYER_MOVEMENT_SPEED;
        }else if(this.movingBackward){
            movementSpeed = -PLAYER_MOVEMENT_SPEED;
        }if(this.rotatingLeft){
            rotationSpeed = PLAYER_ROTATION_SPEED;
        }else if(this.rotatingRight){
            rotationSpeed = -PLAYER_ROTATION_SPEED;
        }

        this.bodyRotation += delta * rotationSpeed;
        this.position.x += delta * movementSpeed * Math.sin(this.bodyRotation),
        this.position.z += delta * movementSpeed * Math.cos(this.bodyRotation);

        let movementData = {
            id: this.id,
            pos: this.position,
            rot: this.bodyRotation
        }

        EventHandler.callEvent(EventHandler.Event.ARENA_PLAYER_MOVEMENT_UPDATE, movementData);
            
    }
}