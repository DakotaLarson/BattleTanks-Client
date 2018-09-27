import { Plane, Ray, Vector3 } from "three";
import Component from "../../component/ChildComponent";
import EventHandler from "../../EventHandler";
import Options from "../../Options";
import PacketSender from "../../PacketSender";
import RaycastHandler from "../../RaycastHandler";
import CollisionHandler from "../CollisionHandler";

const PLAYER_MOVEMENT_SPEED = 3;
const PLAYER_ROTATION_SPEED = 2;

export default class Player extends Component {

    public id: number;

    public position: Vector3;

    public bodyRotation: number;
    public headRotation: number;

    public movingForward: boolean;
    public movingBackward: boolean;
    public rotatingLeft: boolean;
    public rotatingRight: boolean;

    constructor(id: number, pos: Vector3) {
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

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_KEYDOWN, this.onKeyDown);
        EventHandler.addListener(this, EventHandler.Event.DOM_KEYUP, this.onKeyUp);

        EventHandler.addListener(this, EventHandler.Event.DOM_MOUSEDOWN, this.onMouseDown);
        EventHandler.addListener(this, EventHandler.Event.DOM_MOUSEUP, this.onMouseUp);

        EventHandler.addListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.onUpdate);

        EventHandler.addListener(this, EventHandler.Event.GAME_TICK, this.onTick);

        PacketSender.sendPlayerMove(this.position, this.bodyRotation, this.headRotation);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_KEYDOWN, this.onKeyDown);
        EventHandler.removeListener(this, EventHandler.Event.DOM_KEYUP, this.onKeyUp);

        EventHandler.removeListener(this, EventHandler.Event.DOM_MOUSEDOWN, this.onMouseDown);
        EventHandler.removeListener(this, EventHandler.Event.DOM_MOUSEUP, this.onMouseUp);

        EventHandler.removeListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.onUpdate);

        EventHandler.removeListener(this, EventHandler.Event.GAME_TICK, this.onTick);

    }

    public onKeyDown(event: KeyboardEvent) {
        this.onInputDown(event.code);
    }

    public onKeyUp(event: KeyboardEvent) {
       this.onInputUp(event.code);
    }

    public onMouseDown(event: MouseEvent) {
        this.onInputDown(event.button);
    }

    public onMouseUp(event: MouseEvent) {
        this.onInputUp(event.button);
    }

    public onInputDown(code: string | number) {
        if (code === Options.options.forward.code) {
            this.movingForward = true;
        } else if (code === Options.options.backward.code) {
            this.movingBackward = true;
        } else if (code === Options.options.left.code) {
            this.rotatingLeft = true;
        } else if (code === Options.options.right.code) {
            this.rotatingRight = true;
        } else if (code === Options.options.shoot.code) {
            PacketSender.sendPlayerShoot();
        }
    }

    public onInputUp(code: string | number) {
        if (code === Options.options.forward.code) {
            this.movingForward = false;
        } else if (code === Options.options.backward.code) {
            this.movingBackward = false;
        } else if (code === Options.options.left.code) {
            this.rotatingLeft = false;
        } else if (code === Options.options.right.code) {
            this.rotatingRight = false;
        }
    }

    public onUpdate(delta: number) {

        let movementSpeed = 0;
        let rotationSpeed = 0;

        if (this.movingForward && !this.movingBackward) {
            movementSpeed = PLAYER_MOVEMENT_SPEED;
        } else if (this.movingBackward && !this.movingForward) {
            movementSpeed = -PLAYER_MOVEMENT_SPEED;
        }

        if (this.rotatingLeft && !this.rotatingRight) {
            rotationSpeed = PLAYER_ROTATION_SPEED;
        } else if (this.rotatingRight && !this.rotatingLeft) {
            rotationSpeed = -PLAYER_ROTATION_SPEED;
        }

        const potentialRotation = (this.bodyRotation + delta * rotationSpeed);

        const potentialPosition = this.position.clone();
        potentialPosition.x += delta * movementSpeed * Math.sin(potentialRotation),
        potentialPosition.z += delta * movementSpeed * Math.cos(potentialRotation);

        const collisionCorrection = CollisionHandler.getCollision(potentialPosition.clone(), potentialRotation);

        this.computeTurretRotation();

        if (collisionCorrection) {
            potentialPosition.sub(collisionCorrection);
            this.bodyRotation = potentialRotation;
            this.position.copy(potentialPosition);
        } else {
            this.bodyRotation = potentialRotation;
            this.position.copy(potentialPosition);
        }

        const movementData = {
            id: this.id,
            pos: this.position,
            bodyRot: this.bodyRotation,
            headRot: this.headRotation,
            fromServer: false,
        };

        EventHandler.callEvent(EventHandler.Event.ARENA_PLAYER_MOVE, movementData);
    }

    public onTick() {
        PacketSender.sendPlayerMove(this.position, this.bodyRotation, this.headRotation);
    }

    public computeTurretRotation() {
        const ray: Ray = RaycastHandler.getRaycaster().ray;
        const intersection = new Vector3();
        ray.intersectPlane(new Plane(new Vector3(0, 1, 0)), intersection);
        if (intersection) {
            const slope = (this.position.x - intersection.x) / (this.position.z - intersection.z);

            let angle = Math.atan(slope);

            if (this.position.z > intersection.z) {
                angle += Math.PI;
            }
            this.headRotation = angle;
        }
    }
}
