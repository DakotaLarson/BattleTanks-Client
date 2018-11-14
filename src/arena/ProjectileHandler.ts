import { Mesh, MeshLambertMaterial, Scene, SphereGeometry, Vector3 } from "three";
import ChildComponent from "../component/ChildComponent";
import EventHandler from "../EventHandler";

export default class ProjectileHandler extends ChildComponent {

    private static projectileSpeed = 20;

    private projGeo: SphereGeometry;
    private projMat: MeshLambertMaterial;

    private projectiles: Map<number, any>;

    private scene: Scene;

    constructor(scene: Scene) {
        super();

        this.projGeo = new SphereGeometry(0.05);
        this.projMat = new MeshLambertMaterial({
            color: 0xffffff,
        });

        this.scene = scene;

        this.projectiles = new Map();
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.PROJECTILE_LAUNCH, this.onLaunch);
        EventHandler.addListener(this, EventHandler.Event.PROJECTILE_MOVE, this.onMove);
        EventHandler.addListener(this, EventHandler.Event.PROJECTILE_REMOVAL, this.onRemoval);
        EventHandler.addListener(this, EventHandler.Event.PROJECTILE_CLEAR, this.onClear);
        EventHandler.addListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.onUpdate);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.PROJECTILE_LAUNCH, this.onLaunch);
        EventHandler.removeListener(this, EventHandler.Event.PROJECTILE_MOVE, this.onMove);
        EventHandler.removeListener(this, EventHandler.Event.PROJECTILE_REMOVAL, this.onRemoval);
        EventHandler.removeListener(this, EventHandler.Event.PROJECTILE_CLEAR, this.onClear);
        EventHandler.removeListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.onUpdate);
    }

    private onLaunch(data: any) {
        const mesh = new Mesh(this.projGeo, this.projMat);
        mesh.position.copy(data.position);

        this.projectiles.set(data.id, {
            mesh,
            velocity: data.velocity,
        });

        this.scene.add(mesh);
    }

    private onMove(data: any) {
        const proj = this.projectiles.get(data.id);
        if (proj) {
            proj.mesh.position.copy(data.position);
        }
    }

    private onRemoval(projId: number) {
        const proj = this.projectiles.get(projId);
        if (proj) {
            this.scene.remove(proj.mesh);
            this.projectiles.delete(projId);
        }
    }

    private onClear() {
        const iterator = this.projectiles.values();
        let next = iterator.next();
        while (!next.done) {
            this.scene.remove(next.value.mesh);
            next = iterator.next();
        }
        this.projectiles.clear();
    }

    private onUpdate(delta: number) {
        const iterator = this.projectiles.values();
        let next = iterator.next();
        while (!next.done) {
            const mesh = next.value.mesh;
            const velocity = next.value.velocity as Vector3;
            mesh.position.add(velocity.clone().multiplyScalar(delta * ProjectileHandler.projectileSpeed));
            next = iterator.next();
        }
    }
}
