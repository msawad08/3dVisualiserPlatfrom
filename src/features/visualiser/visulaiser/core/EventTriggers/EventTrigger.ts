import { Action } from "../Actions/Action";

export type EventTriggerParams = {
    name?: string;
    action: Action;
}

export class EventTrigger {

    name: string = "AppEventTriger";
    action: Action;
    type: string = "EventTriggerBase";

    constructor(params: EventTriggerParams) {
        this.name = params.name ?? this.name;
        this.action = params.action;
    }

    dispose(){

    }
}