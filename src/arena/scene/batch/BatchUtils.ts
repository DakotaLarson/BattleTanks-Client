import { Color, InstancedBufferAttribute, Vector3 } from "three";

export default class BatchUtils {

    public static createVector3Attribute(offsets: Vector3[]) {

        const rawData = [];
        for (const offset of offsets) {
            rawData.push(offset.x, offset.y, offset.z);
        }

        return BatchUtils.createAttribute(rawData, 3);
    }

    public static createColorAttribute(colors: number[]) {

        const rawData = [];
        for (const rawColor of colors) {
            const color = new Color(rawColor);
            rawData.push(color.r, color.g, color.b);
        }

        return BatchUtils.createAttribute(rawData, 3);
    }

    public static createNumberAttribute(data: number[]) {
        return BatchUtils.createAttribute(data, 1);
    }

    public static createAttribute(data: ArrayLike<number>, itemSize: number, length?: number) {
        const arrayLength = (length || data.length || itemSize);
        const internalData = new Float32Array(arrayLength);

        internalData.set(data);

        const offsetAttribute = new InstancedBufferAttribute(internalData, itemSize);

        offsetAttribute.setDynamic(true);

        return offsetAttribute;
    }
}
