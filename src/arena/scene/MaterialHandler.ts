import { Color, Material, MeshPhongMaterial } from "three";

export default class MaterialHandler {

    private static materials: Map<string, Material> = new Map();

    public static getMaterial(detail: string) {
        let material = MaterialHandler.materials.get(detail);
        if (!material) {
            material = MaterialHandler.generateMaterial(detail);
            MaterialHandler.materials.set(detail, material);
        }

        return material;
    }

    public static clearMaterials() {
        MaterialHandler.materials.clear();
    }

    private static generateMaterial(detail: string) {
        const material = new MeshPhongMaterial({
            color: new Color("#" + detail),
        });

        return material;
    }
}
