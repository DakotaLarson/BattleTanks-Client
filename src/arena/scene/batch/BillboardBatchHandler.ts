import { BufferAttribute, BufferGeometry, Color, InstancedBufferGeometry, Material, Mesh, ShaderMaterial, Shape, ShapeBufferGeometry, TypedArray, Vector2, Vector3, VertexColors } from "three";
import BatchUtils from "./BatchUtils";

export default class BillboardBatchHandler {

    private static geometry: BufferGeometry | undefined;
    private static material: Material | undefined;

    public static initialize() {
        const containerShape = new Shape();

        const fullWidth = 0.75;
        const fullHeight = 0.25;

        containerShape.moveTo(-fullWidth / 2, -fullHeight / 2);
        containerShape.lineTo(-fullWidth / 2, fullHeight / 2);
        containerShape.lineTo(fullWidth / 2, fullHeight / 2);
        containerShape.lineTo(fullWidth / 2, -fullHeight / 2);
        containerShape.lineTo(-fullWidth / 2, -fullHeight / 2);

        const geo = new ShapeBufferGeometry(containerShape);

        const vertexShader = `
            uniform vec2 size;

            attribute vec3 instanceOffset;
            attribute vec3 instanceColor;
            attribute float instancePercentage;

            varying vec3 remainingColor;
            varying float remainingPosition;
            varying float remainingPercentage;

            vec3 billboard(vec3 v, mat4 view) {
                vec3 look = normalize(cameraPosition - instanceOffset);
                vec3 cameraUp = vec3(view[0][1], view[1][1], view[2][1]);
                vec3 billboardRight = cross(cameraUp, look);
                vec3 billboardUp = cross(look, billboardRight);
                vec3 pos = instanceOffset + billboardRight * v.x * size.x + billboardUp * v.y * size.y;
                return pos;
            }

            void main() {
                remainingPosition = (position.x + size.x / 2.0) / size.x;
                remainingPercentage = instancePercentage;
                remainingColor = instanceColor;

                vec3 worldPos = billboard(position, viewMatrix);
                gl_Position = projectionMatrix * viewMatrix * vec4(worldPos, 1.0);
            }
        `;

        const fragmentShader = `

            varying vec3 remainingColor;
            varying float remainingPosition;
            varying float remainingPercentage;

            void main() {
                if (remainingPosition <= remainingPercentage) {
                    gl_FragColor = vec4(remainingColor, 1.0);
                } else {
                    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
                }
            }
        `;

        const material = new ShaderMaterial({
            vertexShader,
            fragmentShader,
            vertexColors: VertexColors,
            uniforms: {
                size: {
                    value: new Vector2(fullWidth, fullHeight),
                },
            },
        });

        BillboardBatchHandler.geometry = geo;
        BillboardBatchHandler.material = material;
    }

    public static create(offsets: Vector3[], colors: number[], percentages: number[]) {
        const geometry = new InstancedBufferGeometry();
        geometry.copy(BillboardBatchHandler.geometry!);

        const offsetAttribute = BatchUtils.createVector3Attribute(offsets);
        const colorAttribute = BatchUtils.createColorAttribute(colors);
        const percentageAttribute = BatchUtils.createNumberAttribute(percentages);

        geometry.addAttribute("instanceOffset", offsetAttribute);
        geometry.addAttribute("instanceColor", colorAttribute);
        geometry.addAttribute("instancePercentage", percentageAttribute);

        geometry.maxInstancedCount = offsets.length;

        const mesh = new Mesh(geometry, BillboardBatchHandler.material);
        mesh.frustumCulled = false;
        // @ts-ignore
        return mesh;
    }

    public static remove(mesh: Mesh, index: number) {
        const geometry = mesh.geometry as InstancedBufferGeometry;

        const offsetAttribute = geometry.getAttribute("instanceOffset") as BufferAttribute;
        const colorAttribute = geometry.getAttribute("instanceColor") as BufferAttribute;
        const percentageAttribute = geometry.getAttribute("instancePercentage") as BufferAttribute;

        (offsetAttribute.array as TypedArray).copyWithin(index * offsetAttribute.itemSize, (index + 1) * offsetAttribute.itemSize);
        (colorAttribute.array as TypedArray).copyWithin(index * colorAttribute.itemSize, (index + 1) * colorAttribute.itemSize);
        (percentageAttribute.array as TypedArray).copyWithin(index * percentageAttribute.itemSize, (index + 1) * percentageAttribute.itemSize);

        geometry.maxInstancedCount --;

        offsetAttribute.needsUpdate = true;
        colorAttribute.needsUpdate = true;
        percentageAttribute.needsUpdate = true;
    }

    public static updatePositions(mesh: Mesh, indices: number[], offsets: Vector3[]) {
        const geometry = mesh.geometry as InstancedBufferGeometry;
        const offsetAttribute = geometry.getAttribute("instanceOffset") as BufferAttribute;
        for (let i = 0; i < indices.length; i ++) {
            (offsetAttribute.array as TypedArray).set([offsets[i].x, offsets[i].y, offsets[i].z], indices[i] * offsetAttribute.itemSize);
        }
        offsetAttribute.needsUpdate = true;
    }

    public static updatePercentage(mesh: Mesh, index: number, percentage: number) {
        const geometry = mesh.geometry as InstancedBufferGeometry;
        const percentageAttribute = geometry.getAttribute("instancePercentage") as BufferAttribute;

        (percentageAttribute.array as TypedArray).set([percentage], index * percentageAttribute.itemSize);

        percentageAttribute.needsUpdate = true;
    }

    public static add(mesh: Mesh, offset: Vector3, color: number, percentage: number) {

        const geometry = mesh.geometry as InstancedBufferGeometry;
        const currentMaxInstancedCount = geometry.maxInstancedCount;
        const computedColor = new Color(color);

        let offsetAttribute = geometry.getAttribute("instanceOffset") as BufferAttribute;
        let colorAttribute = geometry.getAttribute("instanceColor") as BufferAttribute;
        let percentageAttribute = geometry.getAttribute("instancePercentage") as BufferAttribute;

        const insertionOffset = currentMaxInstancedCount * offsetAttribute.itemSize;
        const percentageInsertionOffset = currentMaxInstancedCount * percentageAttribute.itemSize;

        if (offsetAttribute.count < geometry.maxInstancedCount + 1) {
            // Arrays are not long enough to contain another element
            offsetAttribute = BatchUtils.createAttribute(offsetAttribute.array, offsetAttribute.itemSize, currentMaxInstancedCount * 2 * offsetAttribute.itemSize);

            colorAttribute = BatchUtils.createAttribute(colorAttribute.array, colorAttribute.itemSize, currentMaxInstancedCount * 2 * colorAttribute.itemSize);

            percentageAttribute = BatchUtils.createAttribute(percentageAttribute.array, percentageAttribute.itemSize, currentMaxInstancedCount * 2 * percentageAttribute.itemSize);

            geometry.addAttribute("instanceOffset", offsetAttribute);
            geometry.addAttribute("instanceColor", colorAttribute);
            geometry.addAttribute("instancePercentage", percentageAttribute);
        }

        (offsetAttribute.array as TypedArray).set([offset.x, offset.y, offset.z], insertionOffset);
        (colorAttribute.array as TypedArray).set([computedColor.r, computedColor.g, computedColor.b], insertionOffset);
        (percentageAttribute.array as TypedArray).set([percentage], percentageInsertionOffset);

        geometry.maxInstancedCount ++;

        offsetAttribute.needsUpdate = true;
        colorAttribute.needsUpdate = true;
        percentageAttribute.needsUpdate = true;
    }
}
