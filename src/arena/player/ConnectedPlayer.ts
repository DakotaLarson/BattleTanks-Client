import { Vector3, Vector4 } from "three";
import ChildComponent from "../../component/ChildComponent";
import EventHandler from "../../EventHandler";
import CollisionHandler from "../CollisionHandler";

export default class ConnectedPlayer extends ChildComponent {

    public name: string;

    public id: number;

    public color: number;
    private position: Vector3;

    private movementVelocity: number;
    private rotationVelocity: number;

    private bodyRotation: number;
    private headRotation: number;

    constructor(id: number, name: string, color: number, pos: Vector4, headRot: number) {
        super();

        this.id = id;
        this.name = name;

        this.color = color;

        this.position = new Vector3(pos.x, pos.y, pos.z);

        this.movementVelocity = 0;
        this.rotationVelocity = 0;

        this.bodyRotation = pos.w;
        this.headRotation = headRot;
    }

    public updatePosition(pos: Vector3, movementVelocity: number, rotationVelocity: number, bodyRot: number, headRot: number) {
        this.position = pos;
        this.movementVelocity = movementVelocity;
        this.rotationVelocity = rotationVelocity;
        this.bodyRotation = bodyRot;
        this.headRotation = headRot;
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.onFrame);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.onFrame);
    }

    private onFrame(delta: number) {
        const potentialRotation = (this.bodyRotation + delta * this.rotationVelocity);

        const potentialPosition = this.position.clone();
        potentialPosition.x += delta * this.movementVelocity * Math.sin(potentialRotation),
        potentialPosition.z += delta * this.movementVelocity * Math.cos(potentialRotation);

        const collisionCorrection = CollisionHandler.getCollision(potentialPosition.clone(), potentialRotation);

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
            interpolated: true,
        };

        EventHandler.callEvent(EventHandler.Event.CONNECTED_PLAYER_MOVE, movementData);
    }
}
