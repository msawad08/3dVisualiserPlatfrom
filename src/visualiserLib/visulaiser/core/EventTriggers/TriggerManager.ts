import { EventTrigger } from "./EventTrigger";
import { AnimationAction } from "../Actions/AnimationAction";
import { ManagerBase } from "../ManagerBase";
import { Button3d } from "./Button3d";
import { Scene } from "three";
import { AppScene } from "../scene";
import { ActionIds } from "../Actions/ActionManager";



type ActionTriggerParam = {
    type: string;
    actionIds: ActionIds;
    [x: string]: any;
}

export type ActionTriggerConfig =  Record<string, ActionTriggerParam>;



type TriggerType = typeof EventTrigger;

export class TriggerManager extends ManagerBase<EventTrigger>{
    // private static triggers: Map<string, EventTrigger> = new Map();

    // static register(triggerName: string, trigger: EventTrigger){
    //     this.triggers.set(triggerName, trigger); 
    // }
    scene: AppScene;


    constructor(params: ActionTriggerConfig = {}, scene: AppScene){
        super();
        this.scene = scene;
        Object.entries(params).map(this.iniialiseInstance).map(this.addInstance)

    }

    iniialiseInstance =  ([name, {type, actionIds, ...instanceParams}]: [string, ActionTriggerParam]): [string, EventTrigger] =>  {
        let actions = this.scene.actionManager?.actionIdsToAction(actionIds);
        if(!actions) actions = [];
        return [
            name,
            new (TriggerManager.getInstanceType<TriggerType>(type))({actions, scene: this.scene, ...instanceParams})
        ]
    }

}

TriggerManager.register("Button3d", Button3d);


