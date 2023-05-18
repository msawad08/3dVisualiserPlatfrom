import * as THREE from "three";
import { Scene } from "./core/scene";

// init

export class Visualiser {
  canvas?: HTMLCanvasElement;
  scene?: Scene;
  renderer?: THREE.WebGLRenderer;

  init3d(canvas: HTMLCanvasElement) {
    if (!canvas || canvas === this.canvas) return;
    this.canvas = canvas;

    this.scene = new Scene({ canvas });

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvas,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setAnimationLoop(this.animation.bind(this));
    this.renderer.shadowMap.enabled = true;
    // this.renderer.setClearColor(new THREE.Color(0x000000ff))
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; 

    //TODO: Need to remove added for debugging
    (window as any).editor = this;
    (window as any).THREE = THREE;
    // animation


  }
  animation(time: number){

    if(this.scene && this.renderer){
      this.scene.update(time);
  
      this.renderer.render(this.scene, this.scene.camera);

    }
  }
}
