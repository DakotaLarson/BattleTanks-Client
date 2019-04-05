import { BufferGeometry, Group, Material, MaterialCreator, Mesh, MTLLoader, OBJLoader, OBJLoader2 } from "three";

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
            // loader2.load("./res/models/tanks/" + fileName + "/tank.obj", (event: any) => {
            //     console.log(something);
            // });
            loader2.setMaterials(creator.materials);
            loader2.load("./res/models/tanks/" + fileName + "/tank.obj", (event) => {

                // for (const mesh of group.children) {
                //     console.log(mesh);

                //     const materials = (mesh as Mesh).material;
                //     if (Array.isArray(materials)) {
                //         const finalMaterials: Material[] = [];
                //         const groups = ((mesh as Mesh).geometry as BufferGeometry).groups;
                //         for (let i = 0; i < materials.length; i ++) {

                //             let finalMaterialsIndex = finalMaterials.findIndex((finalMaterial) => {
                //                 return materials[i].uuid === finalMaterial.uuid;
                //             });

                //             if (finalMaterialsIndex === -1) {
                //                 finalMaterialsIndex = finalMaterials.push(materials[i]) - 1;
                //             }
                //             groups[i].materialIndex = finalMaterialsIndex;
                //         }
                //         (mesh as Mesh).material = finalMaterials;
                //     }
                // }

                if (flatShading) {
                    for (const mesh of event.detail.loaderRootNode.children) {
                        this.setFlatShading((mesh as Mesh).material);
                    }
                }
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

    private setFlatShading(materials: Material | Material[]) {
        if (Array.isArray(materials)) {
            for (const material of (materials)) {
                material.flatShading = true;
            }
        } else {
            materials.flatShading = true;
        }
    }
}
