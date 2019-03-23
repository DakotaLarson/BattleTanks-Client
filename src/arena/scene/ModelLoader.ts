import { DoubleSide, FrontSide, Group, MaterialCreator, MTLLoader, OBJLoader } from "three";

export default class ModelLoader {

    private cache: Map<string, Group>;

    constructor() {
        this.cache = new Map();
    }

    public getBodyModel() {
        return this.getGroup("body", false);
    }

    public getTurretModel() {
        return this.getGroup("turret", true);
    }

    public getTracksModel() {
       return this.getGroup("track", false);
    }

    private getGroup(fileName: string, doubleSide: boolean) {
        return new Promise((resolve) => {
            const cached = this.cache.get(fileName);
            if (cached) {
                resolve(cached.clone());
            } else {
                this.getMaterial(fileName, doubleSide).then((creator: MaterialCreator) => {
                    this.getModel(fileName, creator).then((group: Group) => {
                        this.cache.set(fileName, group);
                        resolve(group);
                    });
                });
            }
        });
    }

    private getModel(fileName: string, creator: MaterialCreator): Promise<Group> {
        return new Promise((resolve) => {
            const loader = new OBJLoader();
            loader.setMaterials(creator);

            loader.load("/res/models/" + fileName + ".obj", (group: Group) => {
                resolve(group);
            }, undefined, (err: any) => {
                console.error(err);
            });
        });
    }

    private getMaterial(fileName: string, doubleSide: boolean): Promise<MaterialCreator> {
        return new Promise((resolve) => {
            const loader = new MTLLoader();
            loader.setMaterialOptions({
                side: doubleSide ? DoubleSide : FrontSide,
            });

            loader.load("/res/models/" + fileName + ".mtl", (creator: MaterialCreator) => {
                creator.preload();
                resolve(creator);
            }, undefined, (err: any) => {
                console.error(err);
            });
        });
    }
}
