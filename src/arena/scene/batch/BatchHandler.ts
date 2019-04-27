import { BufferAttribute, BufferGeometry, Color, InstancedBufferGeometry, Mesh, MeshLambertMaterial, MeshLambertMaterialParameters, Quaternion, RGBADepthPacking, ShaderChunk, ShaderLib, ShaderMaterial, Side, Texture, TypedArray, UniformsUtils, Vector3, VertexColors } from "three";
import BatchUtils from "./BatchUtils";

export default class BatchHandler {

    public static initialize() {
        ShaderLib.customDepthRGBA = {
            uniforms: ShaderLib.depth.uniforms,
            vertexShader:
                `
                #ifdef INSTANCED
                    attribute vec3 instanceOffset;
                    // attribute float instanceScale;
                #endif
                #include <common>
                #include <uv_pars_vertex>
                #include <displacementmap_pars_vertex>
                #include <morphtarget_pars_vertex>
                #include <skinning_pars_vertex>
                #include <logdepthbuf_pars_vertex>
                #include <clipping_planes_pars_vertex>
                void main() {
                    #include <uv_vertex>
                    #include <skinbase_vertex>
                    #ifdef USE_DISPLACEMENTMAP
                        #include <beginnormal_vertex>
                        #include <morphnormal_vertex>
                        #include <skinnormal_vertex>
                    #endif
                    #include <begin_vertex>
                    // instanced
                    #ifdef INSTANCED
                        // transformed *= instanceScale;
                        transformed = transformed + instanceOffset;
                    #endif
                    #include <morphtarget_vertex>
                    #include <skinning_vertex>
                    #include <displacementmap_vertex>
                    #include <project_vertex>
                    #include <logdepthbuf_vertex>
                    #include <clipping_planes_vertex>
                }
            `,
            fragmentShader: ShaderChunk.depth_frag,
        };
        ShaderLib.lambert = {
            uniforms: ShaderLib.lambert.uniforms,
            vertexShader:
                `
                #define LAMBERT
                #ifdef INSTANCED
                    attribute vec3 instanceOffset;
                    attribute vec3 instanceColor;
                    attribute vec4 instanceRotation;
                    // attribute float instanceScale;
                #endif
                varying vec3 vLightFront;
                varying vec3 vIndirectFront;
                #ifdef DOUBLE_SIDED
                    varying vec3 vLightBack;
                    varying vec3 vIndirectBack;
                #endif
                #include <common>
                #include <uv_pars_vertex>
                #include <uv2_pars_vertex>
                #include <envmap_pars_vertex>
                #include <bsdfs>
                #include <lights_pars_begin>
                #include <color_pars_vertex>
                #include <fog_pars_vertex>
                #include <morphtarget_pars_vertex>
                #include <skinning_pars_vertex>
                #include <shadowmap_pars_vertex>
                #include <logdepthbuf_pars_vertex>
                #include <clipping_planes_pars_vertex>

                vec3 applyQuaternionToVector(vec4 q, vec3 v){
                    return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
                }

                void main() {
                    #include <uv_vertex>
                    #include <uv2_vertex>
                    #include <color_vertex>
                    // vertex colors instanced
                    #ifdef INSTANCED
                    	#ifdef USE_COLOR
                    		vColor.xyz = instanceColor.xyz;
                    	#endif
                    #endif
                    #include <beginnormal_vertex>
                    #include <morphnormal_vertex>
                    #include <skinbase_vertex>
                    #include <skinnormal_vertex>
                    #include <defaultnormal_vertex>
                    #include <begin_vertex>
                    #ifdef INSTANCED
                        // transformed *= instanceScale;
                        // transformed = transformed + instanceOffset;
                        transformed = applyQuaternionToVector(instanceRotation, transformed) + instanceOffset;
                    #endif
                    #include <morphtarget_vertex>
                    #include <skinning_vertex>
                    #include <project_vertex>
                    #include <logdepthbuf_vertex>
                    #include <clipping_planes_vertex>
                    #include <worldpos_vertex>
                    #include <envmap_vertex>
                    #include <lights_lambert_vertex>
                    #include <shadowmap_vertex>
                    #include <fog_vertex>
                }
                `,
            fragmentShader: ShaderLib.lambert.fragmentShader,
        };
    }

    public static create(bufferGeometry: BufferGeometry, offsets: Vector3[], colors: number[], rotations: Quaternion[], map?: Texture, side?: Side, opacity?: number) {
        const geometry = new InstancedBufferGeometry();
        geometry.copy(bufferGeometry);

        const offsetAttribute = BatchUtils.createVector3Attribute(offsets);
        const colorAttribute = BatchUtils.createColorAttribute(colors);
        const rotationAttribute = BatchUtils.createRotationAttribute(rotations);

        geometry.addAttribute("instanceOffset", offsetAttribute);
        geometry.addAttribute("instanceColor", colorAttribute);
        geometry.addAttribute("instanceRotation", rotationAttribute);
        geometry.maxInstancedCount = offsets.length;

        const materialOptions: MeshLambertMaterialParameters = {};
        if (map) {
            materialOptions.map = map;
        } else {
            materialOptions.vertexColors = VertexColors;
        }

        if (side) {
            materialOptions.side = side;
        }

        if (opacity) {
            materialOptions.opacity = opacity;
            materialOptions.transparent = true;
        }

        const material = new MeshLambertMaterial(materialOptions);

        // @ts-ignore
        material.defines = material.defines || {};
        // @ts-ignore
        material.defines.INSTANCED = "";
        // custom depth material - required for instanced shadows
        const shader = ShaderLib.customDepthRGBA;
        const uniforms = UniformsUtils.clone(shader.uniforms);
        const customDepthMaterial = new ShaderMaterial( {
            defines: {
                INSTANCED: "",
                DEPTH_PACKING: RGBADepthPacking,
            },
            uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
        });

        const mesh = new Mesh(geometry, material);
        mesh.frustumCulled = false;
        // @ts-ignore
        mesh.customDepthMaterial = customDepthMaterial;
        return mesh;
    }

    public static remove(mesh: Mesh, index: number) {
        const geometry = mesh.geometry as InstancedBufferGeometry;

        const offsetAttribute = geometry.getAttribute("instanceOffset") as BufferAttribute;
        const colorAttribute = geometry.getAttribute("instanceColor") as BufferAttribute;
        const rotationAttribute = geometry.getAttribute("instanceRotation") as BufferAttribute;

        (offsetAttribute.array as TypedArray).copyWithin(index * offsetAttribute.itemSize, (index + 1) * offsetAttribute.itemSize);
        (colorAttribute.array as TypedArray).copyWithin(index * colorAttribute.itemSize, (index + 1) * colorAttribute.itemSize);
        (rotationAttribute.array as TypedArray).copyWithin(index * rotationAttribute.itemSize, (index + 1) * rotationAttribute.itemSize);

        geometry.maxInstancedCount --;

        offsetAttribute.needsUpdate = true;
        colorAttribute.needsUpdate = true;
        rotationAttribute.needsUpdate = true;
    }

    public static add(mesh: Mesh, offset: Vector3, color: number, rotation: Quaternion) {
        const geometry = mesh.geometry as InstancedBufferGeometry;
        const currentMaxInstancedCount = geometry.maxInstancedCount;
        const computedColor = new Color(color);

        let offsetAttribute = geometry.getAttribute("instanceOffset") as BufferAttribute;
        let colorAttribute = geometry.getAttribute("instanceColor") as BufferAttribute;
        let rotationAttribute = geometry.getAttribute("instanceRotation") as BufferAttribute;

        if (offsetAttribute.count < geometry.maxInstancedCount + 1) {
            // Array is not long enough to contain another element

            offsetAttribute = BatchUtils.createAttribute(offsetAttribute.array, offsetAttribute.itemSize, currentMaxInstancedCount * 2 * offsetAttribute.itemSize);

            colorAttribute = BatchUtils.createAttribute(colorAttribute.array, colorAttribute.itemSize, currentMaxInstancedCount * 2 * colorAttribute.itemSize);

            rotationAttribute = BatchUtils.createAttribute(rotationAttribute.array, rotationAttribute.itemSize, currentMaxInstancedCount * 2 * rotationAttribute.itemSize);

            geometry.addAttribute("instanceOffset", offsetAttribute);
            geometry.addAttribute("instanceColor", colorAttribute);
            geometry.addAttribute("instanceRotation", rotationAttribute);
        }

        (offsetAttribute.array as TypedArray).set([offset.x, offset.y, offset.z], currentMaxInstancedCount * offsetAttribute.itemSize);

        (colorAttribute.array as TypedArray).set([computedColor.r, computedColor.g, computedColor.b], currentMaxInstancedCount * colorAttribute.itemSize);

        (rotationAttribute.array as TypedArray).set([rotation.x, rotation.y, rotation.z, rotation.w], currentMaxInstancedCount * rotationAttribute.itemSize);

        geometry.maxInstancedCount ++;

        offsetAttribute.needsUpdate = true;
        colorAttribute.needsUpdate = true;
        rotationAttribute.needsUpdate = true;
    }

    public static updatePositions(mesh: Mesh, indices: number[], values: Vector3[]) {
        const geometry = mesh.geometry as InstancedBufferGeometry;
        const attribute = geometry.getAttribute("instanceOffset") as BufferAttribute;
        for (let i = 0; i < indices.length; i ++) {
            (attribute.array as TypedArray).set([values[i].x, values[i].y, values[i].z], indices[i] * attribute.itemSize);
        }
        attribute.needsUpdate = true;
    }

    public static updateRotations(mesh: Mesh, indices: number[], values: Quaternion[]) {
        const geometry = mesh.geometry as InstancedBufferGeometry;
        const attribute = geometry.getAttribute("instanceRotation") as BufferAttribute;
        for (let i = 0; i < indices.length; i ++) {
            (attribute.array as TypedArray).set([values[i].x, values[i].y, values[i].z, values[i].w], indices[i] * attribute.itemSize);
        }
        attribute.needsUpdate = true;
    }
}
