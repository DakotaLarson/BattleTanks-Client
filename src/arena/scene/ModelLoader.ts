import { Group, Material, MaterialCreator, Matrix4, Mesh, MTLLoader, OBJLoader2 } from "three";

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
            return group.clone();
        }
    }

    private getModel(fileName: string, creator: MaterialCreator, flatShading?: boolean): Promise<Group> {
        return new Promise((resolve) => {
            const loader2 = new OBJLoader2();
            loader2.logging.enabled = false;
            loader2.meshBuilder.setLogging(false, false);

            loader2.setMaterials(creator.materials);
            loader2.load("./res/models/tanks/" + fileName + "/tank.obj", (event: any) => {

                const head = event.detail.loaderRootNode.getObjectByName("head");
                const body = event.detail.loaderRootNode.getObjectByName("body");

                const group = new Group();
                group.add(body, head);

                if (flatShading) {
                    for (const mesh of group.children) {
                        this.setFlatShading((mesh as Mesh).material);
                    }
                }

                // this.updateHead(head, 1);

                resolve(group);
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
        if (Array.isArray(materials)) {
            for (const material of (materials)) {
                material.flatShading = true;
            }
        } else {
            materials.flatShading = true;
        }
    }

    private updateHead(mesh: Mesh, offset: number) {
        if (offset) {
            mesh.geometry.applyMatrix(new Matrix4().makeTranslation(0, 0, offset));
        }
    }
}
