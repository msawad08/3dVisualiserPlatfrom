import {
  Scene as THREEScene,
  PerspectiveCamera,
  PlaneGeometry,
  Mesh,
  // MeshStandardMaterial,
  Object3D,
  Box3,
  Sphere,
  Vector3,
  AmbientLight,
  DirectionalLight,
  Spherical,
  Color,
  MathUtils,
  TextureLoader,
  HemisphereLight,
  Raycaster,
  Vector2,
  MeshPhysicalMaterial,
  Material
} from "three";
import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransitionMaterial } from "../materials/transitionMaterial"
import { Reflector } from "./reflector";

const defaultConfig = {
  cameraConfig: {
    fov: 70,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.01,
    far: 1000,
  },
  sceneConfig: {
    background: new Color("Black"),
  },
  modelConfig: {
    path: process.env.PUBLIC_URL + "/3dModels/nissanLeaf/scene.gltf",
  },
};

type ConfigTypes = {
  cameraConfig?: {
    fov?: number;
    aspect?: number;
    near?: number;
    far?: number;
  };
  sceneConfig?: {
    background: any
  };
  modelConfig?: {
    path?: string;
  };
  canvas?: HTMLElement,
};
export class Scene extends THREEScene {
  camera: PerspectiveCamera;
  object?: Object3D;
  controls?: OrbitControls; 
  transitionMaterials: Record<string,TransitionMaterial> = {};

  raycaster = new Raycaster();
  pointer = new Vector2();

  constructor({ sceneConfig, cameraConfig, modelConfig, canvas }: ConfigTypes) {
    super();
    this.background = sceneConfig?.background;
    this.camera = this.initCamera({
      ...defaultConfig.cameraConfig,
      ...(cameraConfig ?? {}),
    });
    this.initModel({ ...defaultConfig.modelConfig, ...(modelConfig ?? {}) });
    this.initLights()
    this.initEnvironment()
    canvas && this.initControls(canvas)
  }

  initCamera(cameraConfig = defaultConfig.cameraConfig) {
    const camera = new PerspectiveCamera(
      cameraConfig.fov,
      cameraConfig.aspect,
      cameraConfig.near,
      cameraConfig.far
    );
    camera.position.z = 1;
    return camera;
  }

  initLights() {
    const ambientLight = new AmbientLight(new Color("white"), 0.5 );
    this.add(ambientLight);
    const directionalLight = new DirectionalLight( 0xffffff, 0.5 );
    directionalLight.position.set(10,10,10);
    directionalLight.castShadow = true; // default false

    this.add( directionalLight );

    // const spotLight = new SpotLight( 0xffffff );
    // spotLight.position.set( 0, 20, 0 );
    // spotLight.castShadow = true; // default false

    // this.add( spotLight );
    const light = new HemisphereLight( 0xffffff, 0xffffff, 0.3 );
    this.add( light );
  }

  async initModel(modelConfig = defaultConfig.modelConfig) {
    // const geometry = new BoxGeometry(0.2, 0.2, 0.2);
    // const material = new MeshNormalMaterial();

    // const mesh = new Mesh(geometry, material);
    // this.add(mesh);
    // return mesh;
    const loader = new GLTFLoader();
    loader.loadAsync(modelConfig.path).then((gltf: GLTF) => {
      this.add(gltf.scene);
      this.object = gltf.scene;
      const materials : Record<string, MeshPhysicalMaterial> = {};
      gltf.scene.traverse((child: Object3D)=>{
        if(child instanceof Mesh){
          child.castShadow = true;
          const material = ((child as Mesh).material) as Material;
          if(material && material.type === "MeshPhysicalMaterial"){
              materials[material.uuid] = material as MeshPhysicalMaterial;
          }
        }
      })
      const radius = new Box3()
        .setFromObject(gltf.scene)
        .getBoundingSphere(new Sphere()).radius;
      const spherical = new Spherical(radius*1.5, MathUtils.degToRad(70), MathUtils.degToRad(130));
    //   spherical.
      this.camera.position.setFromSpherical(spherical);
      this.camera.lookAt(new Vector3());

      Object.entries(materials).forEach(([uuid, material]) => {
        const transitionMaterial = new TransitionMaterial(material);
        if(transitionMaterial.material?.uuid)
          this.transitionMaterials[transitionMaterial.material.uuid] = transitionMaterial;
      });

      gltf.scene.traverse((child: Object3D)=>{
        if(child instanceof Mesh && child.material && this.transitionMaterials[child.material.uuid]){
          child.material = this.transitionMaterials[child.material.uuid].material;
        }
      })

      
      // let m = gltf.scene.getObjectByName("chassis#carpaint#LOD2#UV1_Untitled037_31");
      // if(m?.children?.length){
      //   if(m.children[0] instanceof Mesh){
      //     let mesh:any = m.children[0]
      //     const transitionMaterial = new TransitionMaterial(mesh.material, mesh);
      //     this.transitionMaterial = transitionMaterial;
      //     gltf.scene.traverse((ob)=>{
      //       if(ob instanceof Mesh && mesh.material === ob.material){
      //         ob.material = transitionMaterial.material;
      //       }
      //     })
          
      //   }

      // }
      
      console.log(radius)
    });
  }
  async initEnvironment(modelConfig = defaultConfig.sceneConfig) {
    const geometry = new PlaneGeometry(15   , 15);
    
    const material = new MeshPhysicalMaterial({
      color: new Color("Black")
    });
    material.alphaMap = await new TextureLoader().loadAsync(`${process.env.PUBLIC_URL}/3dModels/env/basic/alpha-fog.png`);
    material.transparent = true;

    // const mesh = new Mesh(geometry, material);
    const mesh = new Reflector(geometry, material);
    mesh.rotateX(-Math.PI/2);
    mesh.receiveShadow = true;
    this.add(mesh);

    return mesh;
  }

  initControls(domElement: HTMLElement){
    this.controls = new OrbitControls( this.camera, domElement );
    this.controls.maxPolarAngle = MathUtils.degToRad(75);
    this.controls.enablePan = false;
    
    domElement.addEventListener("click",this.onClick.bind(this))

  }

  onClick(event: MouseEvent){
    this.pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);

    // calculate objects intersecting the picking ray
    const intersects = this.raycaster.intersectObjects(this.children, true);


    if (!intersects[0]?.object) return;
    let mesh = intersects[0].object as Mesh;
    if (!mesh.material) return;

    const material = (mesh.material) as Material;
    this.transitionMaterials[material.uuid]?.onClick(intersects[0].point, mesh);
  }

  update(time: number): void {
    // console.log(time);
    this.controls?.update();
    TransitionMaterial.updateAll(time);
    // if (this.object) {
    // //   this.object.rotation.x = time / 2000;
    //   this.object.rotation.y = time / 1000;
    // }
  }
}
