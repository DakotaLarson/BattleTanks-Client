import { Color, Geometry, Points, PointsMaterial, Scene, Vector3, VertexColors } from "three";
import ChildComponent from "../../component/ChildComponent";
import EventHandler from "../../EventHandler";

export default class FireworkHandler extends ChildComponent {

    private static readonly POINT_COUNT = 100;
    private static readonly POINT_SPEED = 0.5;

    private scene: Scene;

    private points: Points;
    private directions: Vector3[];

    constructor(scene: Scene) {
        super();

        this.scene = scene;

        this.points = new Points(new Geometry(), new PointsMaterial({
            size: 0.1,
            color: 0xffffff,
            opacity: 1,
            vertexColors: VertexColors,
        }));
        this.directions = [];
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.FIREWORK_ADDITION, this.addFirework);
        EventHandler.addListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.onUpdate);

        this.scene.add(this.points);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.FIREWORK_ADDITION, this.addFirework);
        EventHandler.removeListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.onUpdate);

        this.scene.remove(this.points);
    }

    private addFirework(event: any) {
        const pos = event.pos;
        const color = event.color;

        const vertices = [];
        const directions = [];
        const colors = [];

        for (let i = 0; i < FireworkHandler.POINT_COUNT; i ++) {
            vertices.push(pos.clone());
            const to = pos.clone().add(new Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1));
            directions.push(to.sub(pos));
            colors.push(new Color(color));
        }

        const geo = this.points.geometry as Geometry;
        geo.vertices.push.apply(geo.vertices, vertices);
        geo.colors.push.apply(geo.colors, colors);
        this.directions.push.apply(this.directions, directions);

        geo.verticesNeedUpdate = true;
        geo.colorsNeedUpdate = true;

        setTimeout(() => {
            this.removeFirework();
        }, 2500);
    }

    private removeFirework() {
        const geo = this.points.geometry as Geometry;

        geo.vertices.splice(0, FireworkHandler.POINT_COUNT);
        geo.colors.splice(0, FireworkHandler.POINT_COUNT);

        geo.verticesNeedUpdate = true;
        geo.colorsNeedUpdate = true;
        geo.elementsNeedUpdate = true;
    }

    private onUpdate(delta: number) {
        const geo = this.points.geometry as Geometry;
        if (geo.vertices.length) {
            for (let i = 0; i < geo.vertices.length; i ++) {
                const vertex = geo.vertices[i];
                const direction = this.directions[i];
                const addition = direction.clone().multiplyScalar(delta * FireworkHandler.POINT_SPEED);
                vertex.add(addition);
            }
            geo.verticesNeedUpdate = true;
        }
    }
}
