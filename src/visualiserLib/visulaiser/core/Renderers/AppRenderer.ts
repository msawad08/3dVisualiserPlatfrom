import { Camera, Scene, ShadowMapType, WebGLRenderer } from "three";
import { Observable, fromEvent } from "rxjs"

import { EventEmitter } from "events";
import { NodeStyleEventEmitter } from "rxjs/internal/observable/fromEvent";
import { AppScene } from "../scene";

export type AppRendererParams = {
    antialias?: boolean;
    shadowType?: ShadowMapType;
    scene: AppScene;
    canvas: HTMLCanvasElement;
    camera: Camera;
    
}

type Renderer={
    render(scene: Scene, camera: Camera): void;
}

export type RenderStep = {
    renderer?: Renderer;
    scene?: Scene;
    camera?: Camera;
}




export class AppRenderer extends EventEmitter {
    private static ON_RENDER = "ON_RENDER";

    scene: AppScene;
    camera: Camera;
    webGLRender: WebGLRenderer;
    renderStream: Observable<number>;





    constructor(params: AppRendererParams) {
        super();
        this.scene = params.scene;
        this.camera = params.camera;
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
        renderer.autoClear = false;
        // this.renderer.setClearColor(new THREE.Color(0x000000ff))

        return renderer;
    }



    animation = (time: number) => {

        if (this.scene && this.webGLRender) {
            this.webGLRender.clear();
            //   this.scene.update(time);
            this.webGLRender.render(this.scene, this.camera);
            this.scene.otherRenders.forEach(({renderer, scene, camera})=>{
                (renderer ?? this.webGLRender).render(scene ?? this.scene, camera ?? this.camera);
            })

            this.emit(AppRenderer.ON_RENDER, time);

        }
    }

}

