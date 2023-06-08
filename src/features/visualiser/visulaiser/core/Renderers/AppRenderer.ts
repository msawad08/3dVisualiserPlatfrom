import { Camera, Renderer, Scene, ShadowMapType, WebGLRenderer } from "three";
import { Observable, fromEvent } from "rxjs"

import { EventEmitter } from "events";
import { NodeStyleEventEmitter } from "rxjs/internal/observable/fromEvent";

export type AppRendererParams = {
    antialias?: boolean;
    shadowType?: ShadowMapType;
    scene: Scene;
    canvas: HTMLCanvasElement;
    camera: Camera;
    otherRenders?: RenderStep[];
    
}

export type RenderStep = {
    renderer?: Renderer;
    scene?: Scene;
    camera?: Camera;
}




export class AppRenderer extends EventEmitter {
    private static ON_RENDER = "ON_RENDER";

    scene: Scene;
    camera: Camera;
    webGLRender: WebGLRenderer;
    renderStream: Observable<number>;
    otherRenders: RenderStep[] = [];





    constructor(params: AppRendererParams) {
        super();
        this.scene = params.scene;
        this.camera = params.camera;
        this.otherRenders = params.otherRenders ?? this.otherRenders;
        this.renderStream = fromEvent(this as NodeStyleEventEmitter, AppRenderer.ON_RENDER) as Observable<number>;

        this.webGLRender = this.initWebGLRenderer(params);


    }

    initWebGLRenderer(params: AppRendererParams) {
        const renderer = new WebGLRenderer({
            antialias: params?.antialias || false,
            canvas: params.canvas,
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setAnimationLoop(this.animation.bind(this));
        if (params.shadowType) {
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = params.shadowType;
        }
        // this.renderer.setClearColor(new THREE.Color(0x000000ff))

        return renderer;
    }

    addRenderStep(renderStep: RenderStep) {
        this.otherRenders.push(renderStep);
    }
    removeRenderStep(renderStep: RenderStep) {
        this.otherRenders = this.otherRenders.filter((r) => r.scene === renderStep.scene && r.camera === renderStep.renderer && r.renderer === renderStep.renderer)
    }

    animation = (time: number) => {

        if (this.scene && this.webGLRender) {

            //   this.scene.update(time);
            this.webGLRender.render(this.scene, this.camera);
            this.emit(AppRenderer.ON_RENDER, time);

        }
    }

}

