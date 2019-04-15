import { Quaternion, Vector3 } from "three";

export default class Powerup {

    public static readonly SIZE = 0.35;
    public static readonly RADIUS = Math.sqrt(Math.pow(Powerup.SIZE, 2) + Math.pow(Powerup.SIZE, 2));

    private static readonly ROTATION_SPEED = 1.75;
    private static readonly ROTATION_AXIS = new Vector3(0, 1, 0);

    private static readonly HEIGHT_SPEED = 0.05;
    private static readonly MAX_HEIGHT = 0.65;
    private static readonly MIN_HEIGHT = 0.25;

    public type: number;
    public position: Vector3;
    public rotation: Quaternion;

    private rotationAngle: number;
    private rising: boolean;

    constructor(type: number, position: Vector3) {
        this.type = type;
        this.position = position;

        this.rotationAngle = Math.random() * Math.PI * 2;
        this.rotation = new Quaternion().setFromAxisAngle(Powerup.ROTATION_AXIS, this.rotationAngle);

        const y = Math.random() * Powerup.MAX_HEIGHT - Powerup.MIN_HEIGHT;
        position.y = y;
        this.rising = Math.random() < 0.5;
    }

    public update(delta: number) {
        let heightTravel = delta * Powerup.HEIGHT_SPEED;
        if (!this.rising) {
            heightTravel *= -1;
        }

        this.position.y = Math.min(Powerup.MAX_HEIGHT, Math.max(Powerup.MIN_HEIGHT, this.position.y + heightTravel));
        if (this.position.y === Powerup.MAX_HEIGHT || this.position.y === Powerup.MIN_HEIGHT) {
            this.rising = !this.rising;
        }

        this.rotationAngle += delta * Powerup.ROTATION_SPEED % (2 * Math.PI);
        this.rotation.setFromAxisAngle(Powerup.ROTATION_AXIS, this.rotationAngle);
    }

    public equals(powerup: Powerup) {
        return this.type === powerup.type && this.position.x === powerup.position.x && this.position.z === powerup.position.z;
    }
}
