import { Action } from "../Actions/Action";
import { ActionManager, Actions } from "../Actions/ActionManager";
import { AppScene } from "../scene";


export type EventTriggerParams = {
    name?: string;
    actions: Actions;
    scene: AppScene;
    [x: string]: any
}


export class EventTrigger {

    name: string = "AppEventTriger";
    actions: Actions;
    type: string = "EventTriggerBase";
    scene: AppScene;


    constructor(params: EventTriggerParams) {
        this.name = params.name ?? this.name;
        this.actions = params.actions;
        this.scene = params.scene;
    }

    onTrigger = () =>{
        this.scene.actionManager?.replaceQueue(this.actions);
    }

    dispose(){

    }
}
