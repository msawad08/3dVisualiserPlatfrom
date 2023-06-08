import * as THREE from "three";
import { AppScene } from "./core/scene";
import { AppRenderer } from "./core/Renderers/AppRenderer";

// init

export class Visualiser {
  canvas?: HTMLCanvasElement;
  scene?: AppScene;
  renderer?: AppRenderer;

  init3d(canvas: HTMLCanvasElement) {
    if (!canvas || canvas === this.canvas) return;
    this.canvas = canvas;

    this.scene = new AppScene({ canvas });

    this.renderer = new AppRenderer({
      scene: this.scene,
      canvas: this.canvas,
      camera: this.scene.camera,
      antialias: true,
      shadowType: THREE.PCFSoftShadowMap,
    });

    this.renderer.renderStream.subscribe(this.onRender);

    //TODO: Need to remove added for debugging
    (window as any).editor = this;
    (window as any).THREE = THREE;

  }

  onRender = (time: number)=>{
    this.scene?.update(time)
  }

}
