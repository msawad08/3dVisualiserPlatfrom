import * as TWEEN from '@tweenjs/tween.js'
import { Action } from './Action';



type EasingType = typeof TWEEN.Easing.Sinusoidal.In;
type OnUpdateType =  (object: Record<string, number>, elapsed: number) => void
type OnCompleteType =  (object: Record<string, number>) => void

const defaultParams = {
    name: "AnimationAction",
    duration: 3000,
    easing: TWEEN.Easing.Linear.InOut,
    initialValue: { x: 0 },
    finalValue: {x: 1}
}

export  type AnimationActionParams = {
    name?: string,
    duration?: number,
    easing?: EasingType,
    initialValue?: Record<string, number>;
    object?: Record<string, number>;
    finalValue?: Record<string, number>;
    OnUpdateType?: OnUpdateType;
    onComplete?: OnCompleteType;
}
export class AnimationAction extends Action {

   
    static readonly Easing = TWEEN.Easing;

    readonly duration: number;
    readonly easing: EasingType;
    readonly object: Record<string, number>;
    readonly initialValue: Record<string, number>;
    readonly finalValue: Record<string, number>;
    readonly tween: TWEEN.Tween<Record<string, number>>;
    readonly onUpdate?: OnUpdateType;
    readonly onComplete?: OnCompleteType;



    constructor(params: AnimationActionParams = defaultParams) {
        super({name : params.name ?? defaultParams.name})
        this.duration = params.duration ?? defaultParams.duration;
        this.easing = params.easing ?? defaultParams.easing;
        this.object = params.object ?? {...defaultParams.initialValue};
        this.finalValue = params.finalValue ?? defaultParams.finalValue;
        this.initialValue = params.initialValue ?? defaultParams.initialValue;

        this.tween = new TWEEN.Tween(this.object).to(this.finalValue, this.duration)
        .easing(this.easing).onUpdate(this.update).onComplete(this.complete)
    }


    start(): AnimationAction {
        this.tween.start()
        return this;
    }

    end(): AnimationAction {
        this.tween.end();
        return this;
    }
    dispose(): void {
        
    }

    private update = (object: Record<string, number>, elapsed: number)=>{
        this.onUpdate && this.onUpdate(object, elapsed);
    }

    private complete = (object: Record<string, number>)=>{
        this.onComplete && this.onComplete(object);
    }

}