import * as THREE from "three";
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'

class TransitionMaterialEvents extends THREE.EventDispatcher{
    private static  UPDATE_EVENT = "UPDATE_EVENT"
    onUpdate(time: number){
        this.dispatchEvent({type: TransitionMaterialEvents.UPDATE_EVENT, data: {time}});
    }

    addOnUpdateListener(callback: any){
        this.addEventListener(TransitionMaterialEvents.UPDATE_EVENT, callback)
    }

}

export class TransitionMaterial {

    static eventDispatcher = new TransitionMaterialEvents();

    material?: CustomShaderMaterial;
    startTime = 0;
    currentTime = 0;
    constructor(material: THREE.MeshPhysicalMaterial){
        this.material = new CustomShaderMaterial({
            baseMaterial: THREE.MeshPhysicalMaterial,
            vertexShader: `
            varying vec2 vUv;
            varying vec3 vPosition;
            void main() {
                vUv = uv;
                vPosition = csm_Position;
            }
            `,
            fragmentShader: `
                varying vec2 vUv;
                varying vec3 vPosition;
                uniform float a_time;
                uniform vec3 newColor;
                uniform vec3 startPoint;
                void main() {
                    // min(max((vPosition.y+4.0)*0.05, 0.0),1.0)
                    csm_DiffuseColor = mix(csm_DiffuseColor, vec4(newColor.xyz,1.0),(a_time/1000.0) > distance(startPoint, vPosition) ? 1.0:0.0);
                }
            `,
            ...(this.copyMaterial(material)),
            uniforms: {
                newColor: {
                    value: new THREE.Color('#0f4e84').convertLinearToSRGB(),
                },
                a_time:{
                    value: this.currentTime,
                },
                startPoint:{
                    value: new THREE.Vector3(),
                }
            },
        })

        TransitionMaterial.eventDispatcher.addOnUpdateListener((event: any)=>{
            this.update(event.data.time)
        });
    }

    copyMaterial(source: THREE.MeshPhysicalMaterial) {
        const params=  Object.entries({

        name: source.name,
        uuid: source.uuid,
        blending : source.blending,
        side : source.side,
        vertexColors : source.vertexColors,

        opacity : source.opacity,
        transparent : source.transparent,
        color : source.color?.clone(),
		roughness : source.roughness,
		metalness : source.metalness,

		map : source.map,

		lightMap : source.lightMap,
		lightMapIntensity : source.lightMapIntensity,

		aoMap : source.aoMap,
		aoMapIntensity : source.aoMapIntensity,

		emissive : source.emissive?.clone(),
		emissiveMap : source.emissiveMap,
		emissiveIntensity : source.emissiveIntensity,

		bumpMap : source.bumpMap,
		bumpScale : source.bumpScale,

		normalMap : source.normalMap,
		normalMapType : source.normalMapType,
		normalScale : source.normalScale?.clone(),

		displacementMap : source.displacementMap,
		displacementScale : source.displacementScale,
		displacementBias : source.displacementBias,

		roughnessMap : source.roughnessMap,

		metalnessMap : source.metalnessMap,

		alphaMap : source.alphaMap,

		envMap : source.envMap,
		envMapIntensity : source.envMapIntensity,

		wireframe : source.wireframe,
		wireframeLinewidth : source.wireframeLinewidth,
		wireframeLinecap : source.wireframeLinecap,
		wireframeLinejoin : source.wireframeLinejoin,

		flatShading : source.flatShading,

		fog : source.fog,
        clearcoat : source.clearcoat,
        clearcoatMap : source.clearcoatMap,
		clearcoatRoughness : source.clearcoatRoughness,
		clearcoatRoughnessMap : source.clearcoatRoughnessMap,
		clearcoatNormalMap : source.clearcoatNormalMap,
		clearcoatNormalScale: source.clearcoatNormalScale?.clone(),
		ior : source.ior,
		iridescence : source.iridescence,
		iridescenceMap : source.iridescenceMap,
		iridescenceIOR : source.iridescenceIOR,
		iridescenceThicknessRange : [ ...source.iridescenceThicknessRange ],
		iridescenceThicknessMap : source.iridescenceThicknessMap,
		sheen : source.sheen,
		sheenColor: source.sheenColor?.clone(),
		sheenColorMap : source.sheenColorMap,
		sheenRoughness : source.sheenRoughness,
		sheenRoughnessMap : source.sheenRoughnessMap,
		transmission : source.transmission,
		transmissionMap : source.transmissionMap,
		thickness : source.thickness,
		thicknessMap : source.thicknessMap,
		attenuationDistance : source.attenuationDistance,
		attenuationColor: source.attenuationColor?.clone(),
		specularIntensity : source.specularIntensity,
		specularIntensityMap : source.specularIntensityMap,
		specularColor: source.specularColor?.clone(),
		specularColorMap : source.specularColorMap,
        }).filter(([key,value])=> value !== undefined);
        return Object.fromEntries(params);
    }

    update(time: number){
        this.currentTime = time;
        if(this?.material?.uniforms?.a_time)
            this.material.uniforms.a_time.value = this.currentTime - this.startTime;
    }

    onClick(point: THREE.Vector3, mesh: THREE.Mesh){
        if(this?.material?.uniforms?.a_time){
            this.material.uniforms.startPoint.value = mesh?.worldToLocal(point)
            this.restart()
        }
    }

    restart(){
        this.startTime = this.currentTime;
    }

    static updateAll(time: number){
        TransitionMaterial.eventDispatcher.onUpdate(time);
    }

}


