import { Geometry, Points, PointsMaterial, Vector3 } from "three";

export default class Firework {

    private static readonly POINT_COUNT = 100;
    private static readonly POINT_SPEED = 1.25;
    private static readonly POINT_SIZE = 0.05;

    public points: Points;

    private timeAlive: number;
    private directions: Vector3[];

    constructor(pos: Vector3, color: number) {
        const vertices = [];
        this.directions = [];

        for (let i = 0; i < Firework.POINT_COUNT; i ++) {
            vertices.push(pos.clone());
            const to = pos.clone().add(new Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1));
            this.directions.push(to.sub(pos));
        }

        const geo = new Geometry();
        geo.vertices = vertices;
        this.points = new Points(geo, new PointsMaterial({
            size: Firework.POINT_SIZE,
            color,
            opacity: 1,
            transparent: true,
        }));
        this.timeAlive = 0;
    }

    public update(delta: number) {
        this.timeAlive += delta;

        const geo = this.points.geometry as Geometry;
        const mat = this.points.material as PointsMaterial;
        if (geo.vertices.length) {
            for (let i = 0; i < geo.vertices.length; i ++) {
                const vertex = geo.vertices[i];
                const direction = this.directions[i];
                const addition = direction.clone().multiplyScalar(delta * Firework.POINT_SPEED);
                vertex.add(addition);
            }
            mat.opacity = this.computeOpacity(this.timeAlive);

            geo.verticesNeedUpdate = true;
        }
    }

    private computeOpacity(time: number) {
        // curve: http://prntscr.com/nlin8w
        return Math.max(-Math.pow(-time * 0.75, 10) + 1, 0);
    }
}
