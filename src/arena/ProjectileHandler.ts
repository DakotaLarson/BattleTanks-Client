import { Mesh, Quaternion, Scene, SphereBufferGeometry, Vector3 } from "three";
import ChildComponent from "../component/ChildComponent";
import EventHandler from "../EventHandler";
import BatchHandler from "./scene/batch/BatchHandler";

export default class ProjectileHandler extends ChildComponent {

    private static readonly PROJECTILE_SPEED = 20;
    private static readonly PROJECTILE_COLOR = 0xffffff;

    private mesh: Mesh | undefined;

    private projectiles: any[];

    private scene: Scene;

    constructor(scene: Scene) {
        super();
        this.scene = scene;

        this.projectiles = [];
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.PROJECTILE_LAUNCH, this.onLaunch);
        EventHandler.addListener(this, EventHandler.Event.PROJECTILE_REMOVAL, this.onRemoval);
        EventHandler.addListener(this, EventHandler.Event.PROJECTILE_CLEAR, this.onClear);
        EventHandler.addListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.onUpdate);
        this.initializeProjectiles();

    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.PROJECTILE_LAUNCH, this.onLaunch);
        EventHandler.removeListener(this, EventHandler.Event.PROJECTILE_REMOVAL, this.onRemoval);
        EventHandler.removeListener(this, EventHandler.Event.PROJECTILE_CLEAR, this.onClear);
        EventHandler.removeListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.onUpdate);
        this.clearProjectiles();

    }

    private onLaunch(data: any) {
        BatchHandler.add(this.mesh!, data.position, ProjectileHandler.PROJECTILE_COLOR, new Quaternion());
        this.projectiles.push({
            id: data.id,
            position: data.position,
            velocity: data.velocity,
        });
    }

    private onRemoval(projId: number) {
        const index = this.projectiles.findIndex((projectile) => {
            return projectile.id === projId;
        });
        if (index > -1) {
            BatchHandler.remove(this.mesh!, index);
            this.projectiles.splice(index, 1);
        } else {
            console.warn("Unable to find projectile with id:" + projId);
        }
    }

    private onClear() {
        this.clearProjectiles();
        this.initializeProjectiles();
    }

    private initializeProjectiles() {
        this.mesh = BatchHandler.create(new SphereBufferGeometry(0.05), [], [], []);
        this.scene.add(this.mesh);
    }

    private clearProjectiles() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh = undefined;
            this.projectiles = [];
        }
    }

    private onUpdate(delta: number) {
        if (this.mesh) {
            const indices = [];
            const values = [];
            for (let i = 0; i < this.projectiles.length; i ++) {
                const projectile = this.projectiles[i];
                const velocity = projectile.velocity as Vector3;
                const position = projectile.position as Vector3;
                position.add(velocity.clone().multiplyScalar(delta * ProjectileHandler.PROJECTILE_SPEED));
                indices.push(i);
                values.push(position);
            }
            BatchHandler.updatePositions(this.mesh, indices, values);
        }
    }
}
