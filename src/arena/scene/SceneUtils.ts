import { AmbientLight, BufferGeometry, DirectionalLight, Float32BufferAttribute, LineDashedMaterial, LineSegments, Mesh, MeshLambertMaterial, PlaneGeometry, Vector3, Vector4 } from "three";
import SceneHandler from "./SceneHandler";

export default class SceneUtils {
    private sceneHandler: SceneHandler;

    constructor(sceneHandler: SceneHandler) {
        this.sceneHandler = sceneHandler;
    }

    public createLines() {
        const diff = 0.3125;
        const geo = new BufferGeometry();
        const positions = [];
        for (let i = 1; i < this.sceneHandler.width; i ++) {
            positions.push(i, 0.0001, diff);
            positions.push(i, 0.0001, this.sceneHandler.height + diff - 0.5);
        }
        for (let i = 1; i < this.sceneHandler.height; i ++) {
            positions.push(diff, 0.0001, i);
            positions.push(this.sceneHandler.width + diff - 0.5, 0.0001, i);
        }
        geo.addAttribute("position", new Float32BufferAttribute(positions, 3));
        const lineSegments = new LineSegments(geo, new LineDashedMaterial({
            color: 0x000000,
            dashSize: 0.375,
            gapSize: 0.125,
        }));
        lineSegments.computeLineDistances();
        return lineSegments;
    }

    public createLights() {
        // const hemiLight = new HemisphereLight();
        // hemiLight.color.setHSL(0.6, 1, 0.6);
        // hemiLight.groundColor.setHSL(0.095, 1, 0.75);
        // hemiLight.intensity = 0.85;
        // hemiLight.position.copy(this.getCenter().setY(50));

        const dirLight = new DirectionalLight(0xffffff, 0.75);
        dirLight.position.copy(this.getCenter().clone().add(new Vector3(0, 25, 0)));
        dirLight.target.position.copy(this.getCenter());

        const ambientLight = new AmbientLight(0xffffff, 0.5);
        // return [dirLight, dirLight.target, hemiLight];
        return [ambientLight, dirLight];
    }

    public createFloor() {
        const geometry = new PlaneGeometry(this.sceneHandler.width, this.sceneHandler.height);
        const material = new MeshLambertMaterial({color: 0x2e3334});
        const floor = new Mesh(geometry, material);
        floor.rotation.x -= Math.PI / 2;
        floor.position.copy(this.getCenter());
        floor.receiveShadow = true;
        return floor;
    }

    public generatePositionData(data: Vector3[] | Vector4[]): number[] {
        const positionCount = data.length;
        const output = [];
        for (let i = 0; i < positionCount; i ++) {
            const loc = data[i];
            output.push(loc.x, loc.y, loc.z);
            if ((loc as Vector4).w) {
                output.push((loc as Vector4).w);
            }
        }
        return output;
    }

    public parsePositionData(data: any): Vector3[] | undefined {
        if (data) {
            const dataCount = data.length;
            if (dataCount % 3 === 0) {
                const positions = [];
                for (let i = 0; i < dataCount / 3; i ++) {
                    const x = data[i * 3];
                    const y = data[i * 3 + 1];
                    const z = data[i * 3 + 2];

                    positions.push(new Vector3(x, y, z));
                }
                return positions;
            }
        }
        return undefined;
    }

    public parseRotatedPositionData(data: any): Vector4[] {
        if (data) {
            const dataCount = data.length;
            if (dataCount % 4 === 0) {
                const positions = [];
                for (let i = 0; i < dataCount / 4; i ++) {
                    const x = data[i * 4];
                    const y = data[i * 4 + 1];
                    const z = data[i * 4 + 2];
                    const w = data[i * 4 + 3];

                    positions.push(new Vector4(x, y, z, w));
                }
                return positions;
            }
        }
        return [];
    }

    private getCenter() {
        return new Vector3(this.sceneHandler.width / 2, 0, this.sceneHandler.height / 2);
    }
}
