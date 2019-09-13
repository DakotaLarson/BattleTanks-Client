import { Group, Mesh, MeshPhongMaterial } from "three";

import { MaterialCreator, MTLLoader } from "../../../node_modules/three/examples/jsm/loaders/MTLLoader";
import { OBJLoader2 } from "../../../node_modules/three/examples/jsm/loaders/OBJLoader2";

export default class ModelLoader {

    public headMaterialIndicesByNamesByMesh: Map<string, Map<string, number>>;
    public bodyMaterialIndicesByNamesByMesh: Map<string, Map<string, number>>;
    public modelHeadOffsets: Map<string, number>;

    private cache: Map<string, Group>;
    private materials: Map<string, MeshPhongMaterial>;

    constructor() {
        this.cache = new Map();
        this.materials = new Map();
        this.headMaterialIndicesByNamesByMesh = new Map();
        this.bodyMaterialIndicesByNamesByMesh = new Map();
        this.modelHeadOffsets = new Map();
    }

    public async getGroup(fileName: string, headOffset?: number) {
        const cached = this.cache.get(fileName);
        if (cached) {
            const clone = cached.clone();
            this.decoupleMaterials(clone);
            if (headOffset) {
                this.translateHead(clone, fileName, headOffset);
            }
            return clone;
        } else {
            const creator = await this.getMaterial(fileName);
            for (const prop in creator.materials) {
                if (creator.materials.hasOwnProperty(prop)) {
                    const material = creator.materials[prop] as MeshPhongMaterial;
                    this.materials.set(material.color.getHexString(), material);
                }
            }

            const group = await this.getModel(fileName, creator);
            if (headOffset) {
                this.translateHead(group, fileName, headOffset);
            }
            this.mapMaterialIndicesByNames(group, fileName);
            this.cache.set(fileName, group);
            return group.clone();
        }
    }

    private getModel(fileName: string, creator: MaterialCreator): Promise<Group> {
        return new Promise((resolve) => {
            const loader = new OBJLoader2();
            loader.setLogging(false, false);
            loader.materialHandler.setLogging(false, false);

            loader.addMaterials(creator.materials);
            loader.load("./res/models/tanks/" + fileName + "/tank.obj", (group: Group) => {
                this.updateNames(group);
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

    private decoupleMaterials(group: Group) {
        group.traverse((node) => {
            const mesh = node as Mesh;
            if (mesh.isMesh) {
                if (Array.isArray(mesh.material)) {
                    mesh.material = mesh.material.slice();
                }
            }
        });
    }

    private translateHead(group: Group, modelId: string, headOffset?: number) {
        if (headOffset && !this.modelHeadOffsets.has(modelId)) {
            const head = group.getObjectByName("head") as Mesh;
            head.geometry.translate(0, 0, -headOffset);
            this.modelHeadOffsets.set(modelId, headOffset);
        }
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
