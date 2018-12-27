import { Vector3, Vector4 } from "three";
import ChildComponent from "../../component/ChildComponent";
import EventHandler from "../../EventHandler";
import BlockCollisionHandler from "../collision/BlockCollisionHandler";

export default class ConnectedPlayer extends ChildComponent {

    public static readonly X_OFFSET = 0.5;
    public static readonly Z_OFFSET = 0.75;

    public name: string;
    public id: number;
    public bodyRotation: number;

    public color: number;
    private position: Vector3;

    private movementVelocity: number;
    private rotationVelocity: number;

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

    public getCenterPosition() {
        return this.position.clone().add(new Vector3(0.5, 0, 0.5));
    }

    public getInternalPosition(center: Vector3) {
        return center.clone().sub(new Vector3(0.5, 0, 0.5));
    }

    private onFrame(delta: number) {
        const potentialRotation = (this.bodyRotation + delta * this.rotationVelocity);

        const potentialPosition = this.getCenterPosition();
        potentialPosition.x += delta * this.movementVelocity * Math.sin(potentialRotation),
        potentialPosition.z += delta * this.movementVelocity * Math.cos(potentialRotation);

        // Do not run collision detection on other players

        const blockCollision = BlockCollisionHandler.getCollision(potentialPosition.clone(), potentialRotation, ConnectedPlayer.X_OFFSET, ConnectedPlayer.Z_OFFSET);
        potentialPosition.sub(blockCollision.correction);

        this.position.copy(this.getInternalPosition(potentialPosition));
        this.bodyRotation = potentialRotation;

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
