import Component from '../../Component';
import EventHandler from '../../EventHandler';
import { Vector3, Ray, Plane } from 'three';
import RaycastHandler from '../../RaycastHandler';
import PacketSender from '../../PacketSender';
import {CollisionHandler} from '../CollisionHandler';

const PLAYER_MOVEMENT_SPEED = 3;
const PLAYER_ROTATION_SPEED = 2;

export default class Player extends Component{

    id: number;

    position: Vector3;

    bodyRotation: number;
    headRotation : number;

    movingForward: boolean;
    movingBackward: boolean;
    rotatingLeft: boolean;
    rotatingRight: boolean;

    constructor(id: number, pos: Vector3){
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

        EventHandler.addListener(this, EventHandler.Event.DOM_MOUSEDOWN, this.onMouseDown);

        EventHandler.addListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.onUpdate);

        EventHandler.addListener(this, EventHandler.Event.GAME_TICK, this.onTick);

        PacketSender.sendPlayerMove(this.position, this.bodyRotation, this.headRotation);
    }

    disable(){
        EventHandler.removeListener(this, EventHandler.Event.DOM_KEYDOWN, this.onKeyDown);
        EventHandler.removeListener(this, EventHandler.Event.DOM_KEYUP, this.onKeyUp);
        
        EventHandler.removeListener(this, EventHandler.Event.DOM_MOUSEDOWN, this.onMouseDown);


        EventHandler.removeListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.onUpdate);

        EventHandler.removeListener(this, EventHandler.Event.GAME_TICK, this.onTick);

    }

    onKeyDown(event: KeyboardEvent){
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

    onKeyUp(event: KeyboardEvent){
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

    onMouseDown(event: MouseEvent){
        if(event.button === 0){
            PacketSender.sendPlayerShoot();
        }
    }

    onUpdate(delta: number){
        //TODO add check for mouse movement and return if no movement
        // if(!this.movingForward && !this.movingBackward && !this.rotatingLeft && !this.rotatingRight){
        //     return;
        // }

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

        let potentialRotation = (this.bodyRotation + delta * rotationSpeed);

        let potentialPosition = this.position.clone();
        potentialPosition.x += delta * movementSpeed * Math.sin(potentialRotation),
        potentialPosition.z += delta * movementSpeed * Math.cos(potentialRotation);

        let collisionCorrection = CollisionHandler.getCollision(potentialPosition.clone(), potentialRotation);

        this.computeTurretRotation();

        if(collisionCorrection){
            potentialPosition.sub(collisionCorrection);
            this.bodyRotation = potentialRotation;
            this.position.copy(potentialPosition);
        }else{
            this.bodyRotation = potentialRotation;
            this.position.copy(potentialPosition);
        }
        // if(!collisionCorrection){
            
        //     this.bodyRotation = potentialRotation;
        //     this.position.copy(potentialPosition);
        // }

        let movementData = {
            id: this.id,
            pos: this.position,
            bodyRot: this.bodyRotation,
            headRot: this.headRotation
        }

        EventHandler.callEvent(EventHandler.Event.ARENA_PLAYER_MOVEMENT_UPDATE, movementData);      
    }

    onTick(){
        PacketSender.sendPlayerMove(this.position, this.bodyRotation, this.headRotation);
    }

    computeTurretRotation(){
        let ray: Ray = RaycastHandler.getRaycaster().ray;
        let intersection = new Vector3();
        ray.intersectPlane(new Plane(new Vector3(0, 1, 0)), intersection);
        if(intersection){
            let slope = (this.position.x - intersection.x) / (this.position.z - intersection.z);
            
            let angle = Math.atan(slope);

            if(this.position.z > intersection.z){
                angle += Math.PI;
            }
            this.headRotation = angle;
        }
    }
}