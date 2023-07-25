import { Object3D, Quaternion, Scene, Vector3 } from "three";
import { AnimationAction, AnimationActionParams } from "./AnimationAction";
import { ActionManager } from "./ActionManager";

export type RotateObjectActionParams = {
    scene: Scene,
    objectName: string,
    newPivot: Vector3,
    initialValue?: Quaternion,
    finalValue: Quaternion,
} & AnimationActionParams;

export class RotateObjectAction extends AnimationAction{
    object3d: Object3D;
    initialRotation: Quaternion;
    finalRotation: Quaternion;   

    constructor(params: RotateObjectActionParams){
        const {scene, objectName, newPivot, initialValue, finalValue, ...others} = params;
        const object3d = scene.getObjectByName(objectName);
        if(!object3d) throw "Object Not Found";
        super({...others});
        // super({...others, onUpdate: (object, elapsed)=>{
        //     this.updateRotation(object, elapsed)
        // }});
        this.object3d = object3d;
        this.initialRotation = (initialValue && new Quaternion().copy(initialValue)) ?? object3d?.quaternion.clone();
        this.finalRotation =  new Quaternion().copy(finalValue);  

    }

    update(object: Record<string, number>, elapsed: number) {
        this.object3d.quaternion.slerpQuaternions(this.initialRotation, this.finalRotation, object.x)
        super.update(object, elapsed)
    }
    // updateRotation(object: Record<string, number>, elapsed: number) {
    //     this.object3d.quaternion.slerpQuaternions(this.initialRotation, this.finalRotation, object.x)
    //     // super.update(object, elapsed)
    // }
}

