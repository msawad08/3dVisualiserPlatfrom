import { Object3D, Scene, Vector3 } from "three";
import { AnimationAction, AnimationActionParams } from "./AnimationAction";

export type AnimateObjectActionParams = {
    scene: Scene,
    objectName: string,
    propertyName: string,
    newPivot: Vector3,
} & AnimationActionParams;

export class AnimateObjectAction extends AnimationAction{
    object3d?: Object3D; 

    constructor(params: AnimateObjectActionParams){
        const {scene, objectName, propertyName, newPivot, ...others} = params;
        const object3d = scene.getObjectByName(objectName);
        const object = object3d && (object3d as Record<string, any>)[propertyName];

        super({...others, object});

    }
}