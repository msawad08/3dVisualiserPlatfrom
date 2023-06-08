import { Type } from "typescript";
import { EventTrigger } from "./EventTrigger";
import { AnimateObjectAction } from "../Actions/AnimateObjectAction";
import { AnimationAction } from "../Actions/AnimationAction";
import { ManagerBase } from "../ManagerBase";


type ActionTriggerParam = {
    type: string;
    [x: string]: any;
}
type ActionTriggerConfig =  Record<string, ActionTriggerParam>;



type TriggerType = typeof EventTrigger;

export class TriggerManager extends ManagerBase<EventTrigger>{
    // private static triggers: Map<string, EventTrigger> = new Map();

    // static register(triggerName: string, trigger: EventTrigger){
    //     this.triggers.set(triggerName, trigger); 
    // }

    constructor(params: ActionTriggerConfig = {}){
        super();
        Object.entries(params).map(this.iniialiseInstance).map(this.addInstance)

    }

    iniialiseInstance =  ([name, {type, ...instanceParams}]: [string, ActionTriggerParam]): [string, EventTrigger] =>  {
        let action = new AnimationAction({});
        return [
            name,
            new (TriggerManager.getInstanceType<TriggerType>(type))({action,...instanceParams})
        ]
    }

}

