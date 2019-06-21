import { Group, MaterialCreator, Mesh, MTLLoader, OBJLoader2 } from "three";

export default class ModelLoader {

    private cache: Map<string, Group>;

    constructor() {
        this.cache = new Map();
    }

    public async getGroup(fileName: string) {
        const cached = this.cache.get(fileName);
        if (cached) {
            return cached.clone();
        } else {
            const creator = await this.getMaterial(fileName);
            const group = await this.getModel(fileName, creator);
            this.cache.set(fileName, group);
            return group.clone();
        }
    }

    private getModel(fileName: string, creator: MaterialCreator): Promise<Group> {
        return new Promise((resolve) => {
            const loader2 = new OBJLoader2();
            loader2.logging.enabled = false;
            loader2.meshBuilder.setLogging(false, false);

            loader2.setMaterials(creator.materials);
            loader2.load("./res/models/tanks/" + fileName + "/tank.obj", (event: any) => {
                this.updateNames(event.detail.loaderRootNode);
                resolve(event.detail.loaderRootNode);
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

    private updateNames(group: Group) {
        for (const child of group.children) {
            if (child instanceof Group) {
                this.updateNames(child);
            } else if (child instanceof Mesh) {
                if (Array.isArray(child.material)) {
                    for (const mat of child.material) {
                        mat.name = mat.name.split("_")[0];
                    }
                } else {
                    child.material.name = child.material.name.split("_")[0];
                }
            }
        }
    }
}
