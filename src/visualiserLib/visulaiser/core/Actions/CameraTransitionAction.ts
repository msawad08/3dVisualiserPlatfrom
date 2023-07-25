import { Object3D, Spherical, Vector3 } from "three";
import { AnimationAction, AnimationActionParams } from "./AnimationAction";
import { ActionManager } from "./ActionManager";
import { AppScene } from "../scene";
import { CircularInterpolator } from "../../utils/CircularInterpolator";

export type CameraTransitionParams = {
    scene: AppScene,
    distance?: number,
    phi?: number,
    theta?: number,
    newPivot: Vector3,
    speed: number;
} & AnimationActionParams;

export class CameraTransitionAction extends AnimationAction {
    camera: Object3D;
    startSph: Spherical;
    endSph: Spherical;
    phi: CircularInterpolator;
    theta: CircularInterpolator;
    speed: number;
    scene: AppScene;

    private tempSph = new Spherical();


    constructor(params: CameraTransitionParams) {
        const { scene, distance, phi, theta, speed, ...others } = params;
        
        super({...others, })

        this.camera = scene.camera;
        this.scene = scene;
        this.startSph = new Spherical().setFromVector3(this.camera.position);
        this.endSph = new Spherical(distance, phi, theta);
        const angles  = this.updateAngleInterpolator();
        this.phi = angles.phi;
        this.theta = angles.theta;
        this.speed = speed || 10;
    
    }

    updateAngleInterpolator(){
       
        this.phi = new CircularInterpolator(this.startSph.phi, this.endSph.phi  );
        this.theta =  new CircularInterpolator(this.startSph.theta, this.endSph.theta);
        return {phi: this.phi, theta: this.theta}
    }

    start(): AnimationAction {
        this.startSph.setFromVector3(this.camera.position);
        this.updateAngleInterpolator();
        this.duration = Math.max(this.phi.difference, this.theta.difference, Math.abs(this.startSph.radius - this.endSph.radius))/this.speed;
        if( this.scene.controls) this.scene.controls.enabled = false;
        return super.start();
    }

    protected update(object: Record<string, number>, elapsed: number): void {
        const {x:t} = object;
        const {radius: r1} = this.startSph;
        const {radius: r2} = this.endSph;
        const r = r1 + (r2 - r1) * t;

        this.tempSph.set(r, this.phi.interpolate(t), this.theta.interpolate(t));
        this.camera.position.setFromSpherical(this.tempSph);
    }

    protected complete(object: Record<string, number>): void {
        if( this.scene.controls) this.scene.controls.enabled = true;

        super.complete(object);

    }    
}