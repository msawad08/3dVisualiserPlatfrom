import * as TWEEN from '@tweenjs/tween.js'
import { Action } from './Action';
import { ActionManager } from './ActionManager';



type EasingType = typeof TWEEN.Easing.Sinusoidal.In;
type EasingFuctionType = (typeof TWEEN.Easing.Linear) & (typeof TWEEN.Easing.Sinusoidal);
type OnUpdateType =  (object: Record<string, number>, elapsed: number) => void
type OnCompleteType =  (object: Record<string, number>) => void

const defaultParams = {
    name: "AnimationAction",
    duration: 3000,
    easing: TWEEN.Easing.Linear.None,    
    initialValue: { x: 0 },
    finalValue: {x: 1},
    isReversible: false,
}

export  type AnimationActionParams = {
    name?: string,
    duration?: number,
    easing?: EasingType,
    easingFunction?: string,
    easingDirection?: "IN"| "OUT"|"NONE"| "INOUT";
    initialValue?: Record<string, number>;
    object?: Record<string, number>;
    finalValue?: Record<string, number>;
    onUpdate?: OnUpdateType;
    onComplete?: OnCompleteType;
    isReversible?: boolean,
}
export class AnimationAction extends Action {

   
    static readonly Easing = TWEEN.Easing;

    private _duration: number;
    readonly easing: EasingType;
    readonly object: Record<string, number>;
    readonly initialValue: Record<string, number>;
    readonly finalValue: Record<string, number>;
    readonly onUpdate?: OnUpdateType;
    protected onComplete?: OnCompleteType;
    readonly isReversible: boolean;

    get duration (){
        return this._duration;
    }

    protected set duration(value) {
        this._duration = value;
    }
    private tween: TWEEN.Tween<Record<string, number>>;
    private reverseTween?: TWEEN.Tween<Record<string, number>>;

    constructor(params: AnimationActionParams = defaultParams) {
        super({name : params.name ?? defaultParams.name})
        this._duration = params.duration ?? defaultParams.duration;

        this.easing =  params.easing ?? this.getEasing(params) ??defaultParams.easing;

        this.object = params.object ?? {...defaultParams.initialValue};
        this.finalValue = params.finalValue ?? defaultParams.finalValue;
        this.initialValue = params.initialValue?? (params.object && {...params.object}) ?? defaultParams.initialValue;
        this.onUpdate = params.onUpdate;
        this.onComplete = params.onComplete;
        this.isReversible = params.isReversible ?? defaultParams.isReversible;
        this.tween = new TWEEN.Tween(this.object).to(this.finalValue, this.duration)
        .easing(this.easing).onUpdate(this.update.bind(this)).onComplete(this.complete.bind(this));

    }

    getEasing({easingFunction, easingDirection}: AnimationActionParams): EasingType | undefined{
        if(!easingFunction) return;
        const easingType: EasingFuctionType = (TWEEN.Easing as Record<string, any>)[easingFunction];
        if(!easingDirection) {
            return easingFunction == "Linear"? easingType.None : easingType.InOut;
        }
        return (easingType as Record<string, EasingType>)[easingDirection];
    }


    start(): AnimationAction {
        this.tween.start();
        return this;
    }

    end(): AnimationAction {
        this.tween.end();
        return this;
    }
    dispose(): void {
        
    }

    promise(): Promise<Record<string, number>>{
        return new Promise((resolve)=>{
            this.onComplete = resolve
        })
    }

    protected update(object: Record<string, number>, elapsed: number){
        this.onUpdate && this.onUpdate(object, elapsed);
    }

    protected complete(object: Record<string, number>){
        this.onComplete && this.onComplete(object);
        this.tween.stop();

        if(this.isReversible){
            if(!this.reverseTween){
                this.reverseTween = new TWEEN.Tween(this.object).to(this.initialValue, this.duration)
                .easing(this.easing).onUpdate(this.update.bind(this)).onComplete(this.complete.bind(this));
            }
            [this.tween, this.reverseTween] = [this.reverseTween, this.tween];
        }

    }

}

