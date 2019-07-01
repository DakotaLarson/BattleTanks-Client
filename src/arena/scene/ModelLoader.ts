import { Color, Group, MaterialCreator, Mesh, MeshPhongMaterial, MTLLoader, OBJLoader2 } from "three";

export default class ModelLoader {

    public headMaterialIndicesByNamesByMesh: Map<string, Map<string, number>>;
    public bodyMaterialIndicesByNamesByMesh: Map<string, Map<string, number>>;

    private cache: Map<string, Group>;
    private materials: Map<string, MeshPhongMaterial>;

    constructor() {
        this.cache = new Map();
        this.materials = new Map();
        this.headMaterialIndicesByNamesByMesh = new Map();
        this.bodyMaterialIndicesByNamesByMesh = new Map();
    }

    public async getGroup(fileName: string) {
        const cached = this.cache.get(fileName);
        if (cached) {
            return cached.clone();
        } else {
            const creator = await this.getMaterialFromDisk(fileName);

            for (const prop in creator.materials) {
                if (creator.materials.hasOwnProperty(prop)) {
                    const material = creator.materials[prop] as MeshPhongMaterial;
                    this.materials.set(material.color.getHexString(), material);
                }
            }

            const group = await this.getModel(fileName, creator);
            this.mapMaterialIndicesByNames(group, fileName);
            this.cache.set(fileName, group);
            return group.clone();
        }
    }

    public getMaterial(detail: string, existingMaterial: MeshPhongMaterial) {
        let material = this.materials.get(detail);
        if (!material) {
            material = existingMaterial.clone();
            material.color = new Color("#" + detail);
            this.materials.set(detail, material);
        }

        return material;
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

    private getMaterialFromDisk(fileName: string): Promise<MaterialCreator> {
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

    private mapMaterialIndicesByNames(group: Group, title: string) {
        const headMaterialIndicesByNames = new Map();
        const bodyMaterialIndicesByNames = new Map();

        const headMesh = group.getObjectByName("head") as Mesh;
        const bodyMesh = group.getObjectByName("body") as Mesh;

        if (Array.isArray(headMesh.material)) {
            for (let i = 0; i < headMesh.material.length; i ++) {
                const materialName = headMesh.material[i].name;
                headMaterialIndicesByNames.set(materialName, i);
            }
        }

        if (Array.isArray(bodyMesh.material)) {
            for (let i = 0; i < bodyMesh.material.length; i ++) {
                const materialName = bodyMesh.material[i].name;
                bodyMaterialIndicesByNames.set(materialName, i);
            }
        }

        this.headMaterialIndicesByNamesByMesh.set(title, headMaterialIndicesByNames);
        this.bodyMaterialIndicesByNamesByMesh.set(title, bodyMaterialIndicesByNames);
    }
}
