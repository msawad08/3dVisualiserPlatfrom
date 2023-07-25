import { Action } from "./Action";
import { ManagerBase } from "../ManagerBase";
import "./RotateObjectAction"
import "./AnimateObjectAction"
import { RotateObjectAction } from "./RotateObjectAction";
import { AnimateObjectAction } from "./AnimateObjectAction";
import { AnimationAction, Object3D } from "three";
import { CameraTransitionAction } from "./CameraTransitionAction";


type ActionParam = {
    type: string;
    [x: string]: any;
}

export type ActionConfig =  Record<string, ActionParam>;

export type Actions = Action | Action[] | (Action | Action[])[]
export type ActionIds = string | string[] | (string | string[])[]



type ActionType = typeof Action;

export class ActionManager extends ManagerBase<Action>{
    // private static triggers: Map<string, EventTrigger> = new Map();

    // static register(triggerName: string, trigger: EventTrigger){
    //     this.triggers.set(triggerName, trigger); 
    // }
    scene: Object3D;
    queue: Actions;
    executeStack: Actions;
    completionQueue: Actions;
    currentActions?: Action[];

    constructor(params: ActionConfig = {}, scene: Object3D){
        super();
        this.scene = scene;
        Object.entries(params).map(this.initialiseInstance).map(this.addInstance)
        this.queue = [];
        this.executeStack  = [];
        this.completionQueue = [];
    }

    initialiseInstance =  ([name, {type , ...instanceParams}]: [string, ActionParam]): [string, Action] =>  {
        return [
            name,
            new (ActionManager.getInstanceType<ActionType>(type))({...instanceParams, scene: this.scene})
        ]
    }

    endCurrentQueue() {
        throw new Error("Function not implemented.");
    }

    replaceQueue(queue: Actions){
        // this.endCurrentQueue();
        this.queue = queue;
        this.executeStack = Array.isArray(this.queue) ? [...this.queue].reverse(): this.queue;
        this.executeQueue();
    }

    async executeQueue(){
        if(!Array.isArray(this.queue)){
            this.currentActions = [this.queue];
            this.queue = [];
            
        }else if(this.queue.length > 0){
            const action = this.queue.pop();
            this.currentActions = (Array.isArray(action) ? action: [action]) as Action[];
        }else{
            // handleReverseIf
            // this.queue
            return;

        }
        if(Array.isArray(this.currentActions)){
            await Promise.all(this.currentActions.map((action: Action)=>
                action.start().promise()
            ))
            this.executeQueue();
        }

    }


    actionIdsToAction(actions: ActionIds): Actions{
        if(Array.isArray(actions)){
            return (actions.map((a)=> this.actionIdsToAction(a)) as Actions)
        }else{
            const action =  this.getInstance(actions);
            if(!action) throw "Invalid ActionId in Action Configuration";
            return action;
        }
    }

}

// TODO Load Based on Requirement
ActionManager.register("AnimationAction", AnimationAction);
ActionManager.register("AnimationAction", AnimateObjectAction);
ActionManager.register("RotateObjectAction", RotateObjectAction);
ActionManager.register("CameraTransitionAction", CameraTransitionAction);


