import { Group, MaterialCreator, MTLLoader, OBJLoader2 } from "three";

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
}
