import { Group, Material, MaterialCreator, Mesh, MTLLoader, OBJLoader } from "three";

export default class ModelLoader {

    private cache: Map<string, Group>;

    constructor() {
        this.cache = new Map();
    }

    public async getGroup(fileName: string, flatShading?: boolean) {
        const cached = this.cache.get(fileName);
        if (cached) {
            return cached.clone();
        } else {
            const creator = await this.getMaterial(fileName);
            const group = await this.getModel(fileName, creator, flatShading);
            this.cache.set(fileName, group);
            return group;
        }
    }

    private getModel(fileName: string, creator: MaterialCreator, flatShading?: boolean): Promise<Group> {
        return new Promise((resolve) => {
            const loader = new OBJLoader();
            loader.setMaterials(creator);

            loader.load("./res/models/tanks/" + fileName + "/tank.obj", (group: Group) => {

                if (flatShading) {
                    for (const mesh of group.children) {
                        this.setFlatShading((mesh as Mesh).material);
                    }
                }

                resolve(group.clone());
            }, undefined, (err: any) => {
                console.error(err);
            });
        });
    }

    private getMaterial(fileName: string): Promise<MaterialCreator> {
        return new Promise((resolve) => {
            const loader = new MTLLoader();

            loader.load("./res/models/tanks/" + fileName + "/tank.mtl", (creator: MaterialCreator) => {
                creator.preload();
                resolve(creator);
            }, undefined, (err: any) => {
                console.error(err);
            });
        });
    }

    private setFlatShading(materials: Material | Material[]) {
        if (materials.constructor === Array) {
            for (const material of (materials as Material[])) {
                material.flatShading = true;
            }
        } else {
            (materials as Material).flatShading = true;
        }
    }
}
