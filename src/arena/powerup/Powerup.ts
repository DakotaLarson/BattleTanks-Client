import { Vector3 } from "three";

export default class Powerup {

    public static size = 0.35;
    public static radius = Math.sqrt(Math.pow(Powerup.size, 2) + Math.pow(Powerup.size, 2));

    public type: number;
    public position: Vector3;

    constructor(type: number, position: Vector3) {
        this.type = type;
        this.position = position;
    }

    public equals(powerup: Powerup) {
        return this.type === powerup.type && this.position.equals(powerup.position);
    }
}
