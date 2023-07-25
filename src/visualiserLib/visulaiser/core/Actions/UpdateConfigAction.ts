import { AppScene } from "../scene";
import { Action } from "./Action"
import clone from "ramda/src/clone";

enum ConfigType {
    Controls = "Controls",
    Camera = "Camera",

}

export type UpdateConfigActionParam = {
    name: string,
    configType: ConfigType,
    scene: AppScene,
    props: Record<string, any>,
}

export class UpdateConfigAction extends Action {
    protected props: Record<string, any>;
    protected configType: ConfigType;
    protected scene: AppScene;
    protected previousValue: Record<string, any> = {};

    constructor({configType, props, scene, ...params}: UpdateConfigActionParam) {
        super(params)
        this.configType = configType;
        this.props = props; 
        this.scene = scene; 
    }

    start(): Action {
        const configObject: Record<string,any>| undefined = this.getConfigObject();
        if(!configObject) throw "UpdateConfigAction:Invalid Object Type to Config";
        const object  = configObject;

        this.previousValue = Object.fromEntries(Object.entries(this.props).map(([key, value])=>{
            if(object[key]) return [key,value];
            
            let prop = object[key];
            const oldValue = prop.clone ? prop.clone() : clone(prop);
            if(prop.copy) prop.copy(value);
            else object[key] = value;
            return [key,oldValue]
        }))
        return this;
    }

    getConfigObject(){
        switch(this.configType){
            case ConfigType.Controls: return this.scene.controls;
            case ConfigType.Camera: return this.scene.camera;
        }
    }
}