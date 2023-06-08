import { Action } from "../Actions/Action";
import { ManagerBase } from "../ManagerBase";

type ActionParam = {
    type: string;
    [x: string]: any;
}

type ActionConfig =  Record<string, ActionParam>;



type ActionType = typeof Action;

export class ActionManager extends ManagerBase<Action>{
    // private static triggers: Map<string, EventTrigger> = new Map();

    // static register(triggerName: string, trigger: EventTrigger){
    //     this.triggers.set(triggerName, trigger); 
    // }

    constructor(params: ActionConfig = {}){
        super();
        Object.entries(params).map(this.iniialiseInstance).map(this.addInstance)

    }

    iniialiseInstance =  ([name, {type , ...instanceParams}]: [string, ActionParam]): [string, Action] =>  {
        return [
            name,
            new (ActionManager.getInstanceType<ActionType>(type))({...instanceParams})
        ]
    }

}