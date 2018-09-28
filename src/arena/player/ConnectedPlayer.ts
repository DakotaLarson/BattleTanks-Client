import { Vector3, Vector4 } from "three";

export default class ConnectedPlayer {

    public id: number;

    public name: string;

    public position: Vector3;

    public bodyRotation: number;
    public headRotation: number;

    constructor(id: number, name: string, pos: Vector4, headRot: number) {
        this.id = id;
        this.name = name;
        this.position = new Vector3(pos.x, pos.y, pos.z);
        this.bodyRotation = pos.w;
        this.headRotation = headRot;
    }

    public updatePosition(pos: Vector3, bodyRot: number, headRot: number) {
        this.position = pos;
        this.bodyRotation = bodyRot;
        this.headRotation = headRot;
    }
}
