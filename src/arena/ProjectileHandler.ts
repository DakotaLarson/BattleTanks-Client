import { Mesh, MeshLambertMaterial, Scene, SphereGeometry, Vector3 } from "three";
import ChildComponent from "../component/ChildComponent";
import EventHandler from "../EventHandler";

export default class ProjectileHandler extends ChildComponent {

    private static projectileSpeed = 5;

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
        EventHandler.addListener(this, EventHandler.Event.ARENA_PROJECTILE_LAUNCH, this.onLaunch);
        EventHandler.addListener(this, EventHandler.Event.ARENA_PROJECTILE_MOVE, this.onMove);
        // EventHandler.addListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.onUpdate);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.ARENA_PROJECTILE_LAUNCH, this.onLaunch);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_PROJECTILE_MOVE, this.onMove);
        // EventHandler.removeListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.onUpdate);
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

    private onUpdate(delta: number) {
        // for (const data of this.projectiles) {
        //     const mesh = data.mesh;
        //     const velocity = data.velocity as Vector3;
        //     mesh.position.add(velocity.clone().multiplyScalar(delta * ProjectileHandler.projectileSpeed));
        // }
    }
}
