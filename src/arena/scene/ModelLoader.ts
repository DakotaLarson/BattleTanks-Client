import { DoubleSide, GLTF, Material, Mesh } from "three";

export default class ModelLoader {

    private loader: any;

    constructor() {
        // @ts-ignore;
        this.loader = new THREE.GLTFLoader();
    }

    public getBodyModel() {
        return this.getModel("tank_body");
    }

    public getTurretModel() {
        return this.getModel("tank_turret").then((gltf: GLTF) => {
            for (const child of gltf.scene.children) {
                ((child as Mesh).material as Material).side = DoubleSide;
            }
            return gltf;

        });
    }

    public getTracksModel() {
        return this.getModel("tank_tracks");
    }

    private getModel(fileName: string): Promise<GLTF> {
        return new Promise((resolve, reject) => {
            this.loader.load("/res/models/" + fileName + ".glb", (result: GLTF) => {
                resolve(result);
            }, undefined, (err: any) => {
                console.error(err);
                reject(err);
            });
        });
    }
}
