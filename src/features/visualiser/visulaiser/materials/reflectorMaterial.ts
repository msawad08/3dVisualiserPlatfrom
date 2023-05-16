import * as THREE from "three";
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'

export class ReflectionMaterial {
    material?: CustomShaderMaterial;
    textureMatrix = new THREE.Matrix4();

    constructor(material: THREE.MeshPhysicalMaterial, reflectionTexture: THREE.Texture){
        this.material = new CustomShaderMaterial({
            baseMaterial: THREE.MeshPhysicalMaterial,
            vertexShader: `
            varying vec4 vUvReflection;
            uniform mat4 textureMatrix;
            void main() {
                vUvReflection = textureMatrix * vec4( csm_Position, 1.0 );
                
            }
            `,
            fragmentShader: `
                varying vec4 vUvReflection;
                uniform sampler2D tReflection;

                float Directions = 16.0; // BLUR DIRECTIONS (Default 16.0 - More is better but slower)
                float Quality = 3.0; // BLUR QUALITY (Default 4.0 - More is better but slower)
                float Size = 8.0; // BLUR SIZE (Radius)
                
                float Pi = 6.28318530718; // Pi*2


                #include <logdepthbuf_pars_fragment>
    
                float blendOverlay( float base, float blend ) {
        
                    return( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );
        
                }
        
                vec3 blendOverlay( vec3 base, vec3 blend ) {
        
                    return vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ), blendOverlay( base.b, blend.b ) );
        
                }

                vec4 blurTexture(vec4 uv, sampler2D texture){

                    vec4 Radius = vec4(Size/512.0);
                    vec4 color = texture2DProj( texture, vUvReflection );
                    for( float d=0.0; d<Pi; d+=Pi/Directions)
                    {
                        for(float i=1.0/Quality; i<=1.0; i+=1.0/Quality)
                        {
                            color += texture2DProj( texture, uv + vec4(cos(d),sin(d), cos(-d),sin(-d)) * Radius * i);		
                        }
                    }
                    
                    // Output to screen
                    color /= Quality * Directions - 15.0;
                    return color;
                }

                void main() {
                    vec4 base = blurTexture(vUvReflection, tReflection);
                    // vec4 base = texture2DProj( tReflection, vUvReflection );
                    csm_DiffuseColor = vec4( blendOverlay( base.rgb, csm_DiffuseColor.rgb ), 1.0 );
                    // csm_DiffuseColor = vec4( base.rgb, 1.0 );
                }
            `,
            ...(this.copyMaterial(material)),
            uniforms: {
                tReflection: {
                    value: reflectionTexture,
                },
                textureMatrix:{
                    value: this.textureMatrix,
                }
            },
        })
    }

    copyMaterial(source: THREE.MeshPhysicalMaterial) {
        return {

        name: source.name,

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
        }
    }

    update(textureMatrix: THREE.Matrix4){
        this.textureMatrix.copy(textureMatrix)
    }


}


