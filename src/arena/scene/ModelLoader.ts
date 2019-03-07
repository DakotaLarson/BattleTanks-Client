import { GLTF } from "three";

export default class ModelLoader {

    private loader: any;

    private models: Map<string, GLTF>;

    constructor() {
        // @ts-ignore;
        this.loader = new THREE.GLTFLoader();
        this.models = new Map();
    }

    public getBodyModel() {
        return this.getModel("tank_body");
    }

    public getTurretModel() {
        return this.getModel("tank_turret");
    }

    public getTracksModel() {
        return this.getModel("tank_tracks");
    }

    private getModel(fileName: string): Promise<GLTF> {
        return new Promise((resolve, reject) => {
            const cachedModel = this.models.get(fileName);
            if (cachedModel) {
                resolve(cachedModel);
            } else {
                this.loader.load("/res/models/" + fileName + ".glb", (result: GLTF) => {
                    // this.models.set(fileName, result);
                    resolve(result);
                }, undefined, (err: any) => {
                    console.error(err);
                    reject(err);
                });
            }

        });
    }
}
