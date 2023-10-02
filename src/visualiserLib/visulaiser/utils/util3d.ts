import { Material, Mesh, Object3D } from "three";

export function setZIndex( {object, zIndex, material}:{object?: Object3D | Mesh, material?: Material,  zIndex: number}){
    const materials = [];
    if(material){
        material.polygonOffset = true;
        material.polygonOffsetUnits = zIndex;
    }
    if(object) object.traverse((object)=>{
        if(object instanceof Mesh && object.material){
            object.material.polygonOffset = true;
            object.material.polygonOffsetUnits = zIndex;
        }
    })
}