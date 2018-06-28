import {Object3D, Vector3} from 'three';

import Component from 'Component';
import EventHandler from 'EventHandler';
import PlayerRotation from 'PlayerRotation';

export default class PlayerMovement extends Component{

    constructor(scene, camera){
        super();

        this.scene = scene;
        this.camera = camera;

        this.speed = 50;
        this.xSpeed = 30;
        this.zSpeed = 40;

        this.speedMultiplier = 1.5;

        this.jumpPower = 25;

        this.inAir = false;

        this.velocity = new Vector3();

        this.pitchObject = new Object3D();

        this.yawObject = new Object3D();
        this.yawObject.position.y = 6;
        this.yawObject.add(this.pitchObject);

        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.sprinting = false;
        this.jumping = false;
        this.firstPersonRotation = new PlayerRotation(this.yawObject, this.pitchObject);
    }

    enable = () => {
        this.scene.add(this.yawObject);
        this.pitchObject.add(this.camera);

        this.attachChild(this.firstPersonRotation);

        EventHandler.addListener(EventHandler.Event.GAME_ANIMATION_UPDATE, this.move);

        EventHandler.addListener(EventHandler.Event.GUI_TOGGLE_CONTROLS_ENABLED, this.handleRotationEnabled);
        EventHandler.addListener(EventHandler.Event.GUI_TOGGLE_CONTROLS_DISABLED, this.handleRotationDisabled);
    };

    disable = () => {
        this.pitchObject.remove(this.camera);
        this.scene.remove(this.yawObject);

        EventHandler.removeListener(EventHandler.Event.GAME_ANIMATION_UPDATE, this.move);

        EventHandler.removeListener(EventHandler.Event.GUI_TOGGLE_CONTROLS_ENABLED, this.handleRotationEnabled);
        EventHandler.removeListener(EventHandler.Event.GUI_TOGGLE_CONTROLS_DISABLED, this.handleRotationDisabled);
        this.moveForward = this.moveBackward = this.moveLeft = this.moveRight = this.sprinting = this.jumping = false;
    };

    move = (delta) => {
        let moving = false;

        this.velocity.x -= this.velocity.x * 10.0 * delta;
        this.velocity.z -= this.velocity.z * 10.0 * delta;
        this.velocity.y -= 9.8 * 10.0 * delta;

        if(!this.inAir && this.jumping){
            this.velocity.y += this.jumpPower;
            this.inAir = true;
        }

        if(this.moveForward && !this.moveBackward){
            moving = true;
            if((this.moveLeft || this.moveRight) && !(this.moveLeft && this.moveRight)){

                if(this.sprinting){
                    this.velocity.z -= this.zSpeed * delta * this.speedMultiplier;
                }else{
                    this.velocity.z -= this.zSpeed * delta;
                }

            }else{

                if(this.sprinting){
                    this.velocity.z -= this.speed * delta * this.speedMultiplier;
                }else{
                    this.velocity.z -= this.speed * delta;
                }

            }
        }

        else if(this.moveBackward && !this.moveForward){
            moving = true;
            if((this.moveLeft || this.moveRight) && !(this.moveLeft && this.moveRight)){
                this.velocity.z += this.zSpeed * delta;
            }else{
                this.velocity.z += this.speed * delta;
            }

        }

        if(this.moveLeft && !this.moveRight){
            moving = true;
            if((this.moveForward || this.moveBackward) && !(this.moveForward && this.moveBackward)){
                this.velocity.x -= this.xSpeed * delta;
            }else{
                this.velocity.x -= this.speed * delta;
            }
        }

        else if(this.moveRight && !this.moveLeft){
            moving = true;
            if((this.moveForward || this.moveBackward) && !(this.moveForward && this.moveBackward)){
                this.velocity.x += this.xSpeed * delta;
            }else{
                this.velocity.x += this.speed * delta;
            }
        }

        if(!moving){
            if(Math.abs(this.velocity.x) < 0.005) this.velocity.x = 0;
            if(Math.abs(this.velocity.z) < 0.005) this.velocity.z = 0;
        }

        this.yawObject.translateX(this.velocity.x * delta * this.speedMultiplier);
        this.yawObject.translateY(this.velocity.y * delta * this.speedMultiplier);
        this.yawObject.translateZ(this.velocity.z * delta * this.speedMultiplier);

        if(this.yawObject.position.y < 6){
            this.yawObject.position.y = 6;
            this.velocity.y = 0;
            this.inAir = false;
        }
    };

    handleRotationEnabled = () => {
        this.attachChild(this.firstPersonRotation);
    };

    handleRotationDisabled = () => {
        this.detachChild(this.firstPersonRotation);
    };
}
