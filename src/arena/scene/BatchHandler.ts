import { BufferAttribute, BufferGeometry, InstancedBufferAttribute, InstancedBufferGeometry, Mesh, MeshLambertMaterial, RGBADepthPacking, ShaderChunk, ShaderLib, ShaderMaterial, TypedArray, UniformsUtils, Vector3 } from "three";

export default class BatchHandler {

    public static initialize() {
        ShaderLib.customDepthRGBA = { // this is a cut-and-paste of the depth shader -- modified to accommodate instancing for this app
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
        ShaderLib.lambert = { // this is a cut-and-paste of the lambert shader -- modified to accommodate instancing for this app
            uniforms: ShaderLib.lambert.uniforms,
            vertexShader:
                `
                #define LAMBERT
                #ifdef INSTANCED
                    attribute vec3 instanceOffset;
                    // attribute vec3 instanceColor;
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
                void main() {
                    #include <uv_vertex>
                    #include <uv2_vertex>
                    #include <color_vertex>
                    //vertex colors instanced
                    // #ifdef INSTANCED
                    // 	#ifdef USE_COLOR
                    // 		vColor.xyz = instanceColor.xyz;
                    // 	#endif
                    // #endif
                    #include <beginnormal_vertex>
                    #include <morphnormal_vertex>
                    #include <skinbase_vertex>
                    #include <skinnormal_vertex>
                    #include <defaultnormal_vertex>
                    #include <begin_vertex>
                    // position instanced
                    #ifdef INSTANCED
                        // transformed *= instanceScale;
                        transformed = transformed + instanceOffset;
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

    public static create(bufferGeometry: BufferGeometry, offsets: Vector3[], color: number, quantity?: number) {
        const geometry = new InstancedBufferGeometry();

        geometry.copy(bufferGeometry);

        const offsetArray = [];
        for (const offset of offsets) {
            offsetArray.push(offset.x, offset.y, offset.z);
        }

        const arrayLength = (quantity || offsets.length || 8) * 3;
        const floatArray = new Float32Array(arrayLength);
        floatArray.set(offsetArray);

        const offsetAttribute = new InstancedBufferAttribute(floatArray, 3); offsetAttribute.setDynamic(true);

        geometry.addAttribute("instanceOffset", offsetAttribute);
        geometry.maxInstancedCount = offsets.length;

        const material = new MeshLambertMaterial( {
            color,
        } );
        // @ts-ignore
        material.defines = material.defines || {};
        // @ts-ignore
        material.defines.INSTANCED = "";
        // custom depth material - required for instanced shadows
        const shader = ShaderLib.customDepthRGBA;
        const uniforms = UniformsUtils.clone( shader.uniforms );
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

    public static delete(mesh: Mesh, index: number) {
        const geometry = mesh.geometry as InstancedBufferGeometry;
        const offsetAttribute = geometry.getAttribute("instanceOffset") as BufferAttribute;
        (offsetAttribute.array as TypedArray).copyWithin(index, index + offsetAttribute.itemSize);

        geometry.maxInstancedCount --;
        offsetAttribute.needsUpdate = true;
    }

    public static add(mesh: Mesh, offset: Vector3) {
        const geometry = mesh.geometry as InstancedBufferGeometry;
        const currentMaxInstancedCount = geometry.maxInstancedCount;
        let offsetAttribute = geometry.getAttribute("instanceOffset") as BufferAttribute;

        const insertionOffset = currentMaxInstancedCount * offsetAttribute.itemSize;

        if (offsetAttribute.count < geometry.maxInstancedCount + 1) {
            // Array is not long enough to contain another element

            const newOffsetArray = new Float32Array((currentMaxInstancedCount * 2) * offsetAttribute.itemSize);
            newOffsetArray.set(offsetAttribute.array);

            offsetAttribute = new InstancedBufferAttribute(newOffsetArray, 3);
            offsetAttribute.setDynamic(true);
            geometry.addAttribute("instanceOffset", offsetAttribute);
        }

        (offsetAttribute.array as TypedArray).set([offset.x, offset.y, offset.z], insertionOffset);

        geometry.maxInstancedCount ++;
        offsetAttribute.needsUpdate = true;
    }

    public static update(mesh: Mesh, indices: number[], values: Vector3[]) {
        const geometry = mesh.geometry as InstancedBufferGeometry;
        const offsetAttribute = geometry.getAttribute("instanceOffset") as BufferAttribute;
        for (let i = 0; i < indices.length; i ++) {
            (offsetAttribute.array as TypedArray).set([values[i].x, values[i].y, values[i].z], indices[i] * offsetAttribute.itemSize);
        }
        offsetAttribute.needsUpdate = true;
    }
}
