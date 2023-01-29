import * as THREE from "three";
import { Scene } from "./scene";

// init

export class Visualiser {
  canvas?: HTMLCanvasElement;

  init3d(canvas: HTMLCanvasElement) {
    if (!canvas || canvas === this.canvas) return;
    this.canvas = canvas;

    const scene = new Scene({ canvas });

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvas,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animation);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; 

    // animation

    function animation(time: number) {

      scene.update(time);

      renderer.render(scene, scene.camera);
    }
  }
}
