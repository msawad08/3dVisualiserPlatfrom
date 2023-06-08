import { Euler, Object3D, Quaternion, Vector3 } from "three";
import { EventTrigger, EventTriggerParams } from "./EventTrigger";
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

import { Group } from "@tweenjs/tween.js";


type Button3dParams = {
    position: Vector3;
    rotation: Quaternion|Vector3|Euler;
    parent: Object3D;


} & EventTriggerParams;

class Button3d  extends EventTrigger{
    
    constructor(params: Button3dParams){
        const {rotation, position, ...other} = params; 
        super(other);
        this.type = "Button3d";
        
    }

    dispose(): void {
        super.dispose()
    }
}
