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
  Material,
  Group,
  RepeatWrapping,
  Texture,
  // SphereGeometry,
  MeshBasicMaterial,
  CylinderGeometry,
  BackSide,
  Float32BufferAttribute,
  ColorRepresentation,
  Quaternion,
  Wrapping,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransitionMaterial } from "../materials/transitionMaterial"
import { Reflector } from "./reflector";
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { ActionConfig, ActionManager } from "./Actions/ActionManager";
import { ActionTriggerConfig, TriggerManager } from "./EventTriggers/TriggerManager";
import { RenderStep } from "./Renderers/AppRenderer";
import * as TWEEN from "@tweenjs/tween.js";
import { setZIndex } from "../utils/util3d";


const defaultConfig = {
  cameraConfig: {
    fov: 70,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.01,
    far: 1000,
  },
  sceneConfig: {
    backgroundColor: "White",
  },
  modelConfig: {
    path: process.env.PUBLIC_URL + "/3dModels/toyota_supra_mk4/scene.gltf",
    transitionAllowedMaterials: ["Paint"],
    materials: {
      
    }
  },
  

  actionConfig: {
    doorLeftOpenAnimation: {
      type: "RotateObjectAction",
      name: "doorLeftOpenAnimation",
      finalValue: new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), MathUtils.degToRad(-45)),
      objectName: "door_left",
      easingFunction: "Sinusoidal",
      easingDirection: "In",
      duration: 1000,
      isReversible: true,
    },
    doorRightOpenAnimation: {
      type: "RotateObjectAction",
      name: "doorRightOpenAnimation",
      finalValue: new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), MathUtils.degToRad(45)),
      objectName: "door_right",
      easingFunction: "Sinusoidal",
      easingDirection: "In",
      duration: 1000,
      isReversible: true,
    },
    cameraToLeftDoor: {
      type: "CameraTransitionAction",
      distance: 4,
      theta: MathUtils.degToRad(90),
      phi: MathUtils.degToRad(70),
      speed: 10,
    }
  },

  actionTriggerConfig: {
    doorOpenButtonLeft: {
      type: "Button3d",
      position: { x: 1.035, y: 0.720, z: -0.646 },
      rotation: { x: 0, y: Math.PI / 2, z: 0 },
      attachToObject: "door_left",
      // actionId: "doorLeftOpenAnimation",
      actionIds: [["cameraToLeftDoor", "doorLeftOpenAnimation"]],

    },
    doorOpenButtonRight: {
      type: "Button3d",
      position: { x: -1.035, y: 0.720, z: -0.646 },
      rotation: { x: 0, y: Math.PI / 2, z: 0 },
      attachToObject: "door_right",
      actionIds: "doorRightOpenAnimation",
    }
  },



};

export type SceneConfigType = {
  cameraConfig?: {
    fov?: number;
    aspect?: number;
    near?: number;
    far?: number;
  };
  sceneConfig?: {
    backgroundColor?: ColorRepresentation;
    backgroundTexture?: string;
  };
  modelConfig?: {
    path?: string;
    transitionAllowedMaterials?: string[],
  };
  canvas?: HTMLElement,
  actionConfig?: ActionConfig,
  actionTriggerConfig?: ActionTriggerConfig,
};
export class AppScene extends THREEScene {
  camera: PerspectiveCamera;
  object?: Object3D;
  controls?: OrbitControls;
  transitionMaterials: Record<string, TransitionMaterial> = {};
  textureLoader: TextureLoader;

  raycaster = new Raycaster();
  pointer = new Vector2();
  actionManager?: ActionManager;
  triggerManager?: TriggerManager;

  otherRenders: RenderStep[] = [];
  canvas: HTMLElement | undefined;


  constructor({
    sceneConfig = defaultConfig.sceneConfig,
    cameraConfig, modelConfig, canvas,
    actionConfig = defaultConfig.actionConfig,
    actionTriggerConfig = defaultConfig.actionTriggerConfig
  }: SceneConfigType) {
    super();
    this.textureLoader = new TextureLoader();

    this.initBackground(sceneConfig);
    this.camera = this.initCamera({
      ...defaultConfig.cameraConfig,
      ...(cameraConfig ?? {}),
    });
    this.initModel({ ...defaultConfig.modelConfig, ...(modelConfig ?? {}) }).then((object) => {
      this.object = object;
      this.actionManager = this.initActions(actionConfig);
      this.triggerManager = this.initTriggers(actionTriggerConfig);
    });
    this.initLights()
    this.initEnvironment()
    this.canvas = canvas;
    canvas && this.initControls(canvas)
  }

  private initBackground(sceneConfig: { backgroundColor?: ColorRepresentation | undefined; backgroundTexture?: string | undefined; }) {
    if (sceneConfig?.backgroundColor) {
      this.background = new Color(sceneConfig.backgroundColor);
    } else if (sceneConfig.backgroundTexture) {
      this.textureLoader.load(sceneConfig.backgroundTexture);
    }
  }

  initCamera(cameraConfig = defaultConfig.cameraConfig) {
    const camera = new PerspectiveCamera(
      cameraConfig?.fov,
      cameraConfig?.aspect,
      cameraConfig?.near,
      cameraConfig?.far
    );
    camera.position.z = 1;
    return camera;
  }

  initLights() {
    const ambientLight = new AmbientLight(new Color("white"), 0.3);
    this.add(ambientLight);
    const directionalLight = new DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(10, 10, 0);
    directionalLight.castShadow = true;
    this.add(directionalLight);

    // this.add( spotLight );
    const light = new HemisphereLight(0xffffff, 0xffffff, 0.3);
    this.add(light);
  }

  async initModel(modelConfig = defaultConfig.modelConfig): Promise<Object3D> {
    // const geometry = new BoxGeometry(0.2, 0.2, 0.2);
    // const material = new MeshNormalMaterial();

    // const mesh = new Mesh(geometry, material);
    // this.add(mesh);
    // return mesh;
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(modelConfig?.path)
    this.add(gltf.scene);
    const materials: Record<string, Material> = {};
    gltf.scene.traverse((child: Object3D) => {
      if (child instanceof Mesh) {
        child.castShadow = true;
        const material = ((child as Mesh).material) as Material;
        if (material && modelConfig.transitionAllowedMaterials.includes(material.name)) {
          materials[material.uuid] = material;
        }
      }
    })
    const radius = new Box3()
      .setFromObject(gltf.scene)
      .getBoundingSphere(new Sphere()).radius;
    const spherical = new Spherical(radius * 1.5, MathUtils.degToRad(70), MathUtils.degToRad(130));
    //   spherical.
    this.camera.position.setFromSpherical(spherical);
    this.camera.lookAt(new Vector3());

    if (this.controls) {
      this.controls.maxDistance = radius * 3;
      this.controls.minDistance = radius;
    }


    Object.entries(materials).forEach(([uuid, material]) => {
      const transitionMaterial = new TransitionMaterial(material);
      if (transitionMaterial.material?.uuid)
        this.transitionMaterials[transitionMaterial.material.uuid] = transitionMaterial;
    });

    gltf.scene.traverse((child: Object3D) => {
      if (child instanceof Mesh && child.material && this.transitionMaterials[child.material.uuid]) {
        // child.material = this.transitionMaterials[child.material.uuid].material;
        this.transitionMaterials[child.material.uuid].attachMesh(child)
      }
    });
    return gltf.scene;
  }
  async initEnvironment(modelConfig = defaultConfig.sceneConfig) {
    const environment = new Group()

    // create Floor
    const geometry = new PlaneGeometry(15, 15);
    // geometry.rotateX(-Math.PI / 2);
    const materialReflector = new MeshPhysicalMaterial({
      color: new Color("white"),
      opacity: 0.5,
      transparent: true,
    });
    const materialFloor = new MeshBasicMaterial({
      // color: new Color("black"),
      transparent: true,
    });
    materialFloor.alphaMap = materialReflector.alphaMap = await this.textureLoader.loadAsync(`${process.env.PUBLIC_URL}/3dModels/env/basic/alpha-fog.png`);
    materialFloor.map = await this.textureLoader.loadAsync(`${process.env.PUBLIC_URL}/3dModels/env/basic/Seamless grey marble texture.jpg`);
    materialFloor.map.wrapS = materialFloor.map.wrapT = RepeatWrapping;
    materialFloor.map.repeat.set(50,50);
    // materialReflector.transparent = true;
    // const mesh = new Mesh(geometry, material);
    const meshReflector = new Reflector(geometry, materialReflector);
    const meshFloor = new Mesh(geometry, materialFloor);

    meshReflector.renderOrder = 5;
    meshReflector.rotateX(-Math.PI / 2);
    meshFloor.rotateX(-Math.PI / 2);
    meshFloor.scale.set(5,5,1);
    setZIndex({object: meshFloor, zIndex: 25});
    setZIndex({object: meshReflector, zIndex: 0});
    meshFloor.receiveShadow = true;
    environment.add(meshReflector);
    environment.add(meshFloor);
    
    // const exr = await (new EXRLoader().loadAsync(`${process.env.PUBLIC_URL}/3dModels/env/outdoor/spree_bank_4k.exr`));
    // this.environment = exr;
    // const height = 8, width = 15;
    // const domeGeometry = new CylinderGeometry(width / 2, width / 2, height)
    // const dome = new Mesh(
    //   domeGeometry,
    //   new MeshBasicMaterial({ map: exr, side: BackSide }),
    // )
    // dome.position.y += height / 2 - 0.1;
    // dome.renderOrder = 1;

    // const positionAttribute = dome.geometry.getAttribute('position');
    // const uvAttribute = new Float32BufferAttribute(new Float32Array(positionAttribute.count * 2), 2);
    // dome.geometry.setAttribute('uv', uvAttribute);
    // let floorUV = 0.0;
    // for (let i = 0; i < positionAttribute.count; i++) {
    //   const vertex = new Vector3();
    //   vertex.fromBufferAttribute(positionAttribute, i);

    //   const theta = Math.atan2(vertex.x, -vertex.z);
    //   // const u = temp.set(vertex.x,vertex.z).angle()/Math.PI/2;

    //   const u = (theta + Math.PI) / (2 * Math.PI);
    //   // us.push(u);/

    //   let v = floorUV + ((vertex.y + height / 2) / height) * (1 - floorUV * 2);
    //   if (vertex.y === -height / 2) {
    //     v = vertex.x === 0 && vertex.z === 0 ? 0 : floorUV;
    //   }
    //   else if (vertex.y === height / 2) {
    //     v = vertex.x === 0 && vertex.z === 0 ? 1.0 : 1 - floorUV;

    //   }
    //   uvAttribute.setXY(i, u, v);
    // }
    // // console.log("U Max and Min", Math.max(...us), Math.min(...us), us.length, us);
    // environment.add(dome);

    //Create Wall

    // const wallGeometry = new PlaneGeometry(width   , height);
    // const textureRepeat = new Vector2(3,4);
    // const wallMaterial = new MeshPhysicalMaterial({
    //   map: await this.loadTexture('3dModels/env/outdoor/132_old wall brick.jpg', {repeat: textureRepeat} ),
    //   normalMap: await this.loadTexture('3dModels/env/outdoor/132_old wall brick_normal.jpg',{repeat: textureRepeat}),
    //   roughnessMap: await this.loadTexture('3dModels/env/outdoor/132_old wall brick_rough.jpg',{repeat: textureRepeat}),
    //   // side: DoubleSide
    // });
    // wallMaterial.map?.repeat.set(3,3);
    // const wallMesh = new Mesh(wallGeometry, wallMaterial);
    // wallMesh.position.y += height/2;
    // wallMesh.position.z -= width/2;

    // environment.add(wallMesh);

    this.add(environment)

    return environment;
  }

  async loadTexture(path: string, { repeat }: { repeat?: Vector2 } = {}): Promise<Texture> {
    const texture = await this.textureLoader.loadAsync(`${process.env.PUBLIC_URL}/${path}`);
    texture.wrapS = texture.wrapT = RepeatWrapping;
    repeat && texture.repeat.copy(repeat);
    return texture
  }

  initControls(domElement: HTMLElement) {
    this.controls = new OrbitControls(this.camera, domElement);
    this.controls.maxPolarAngle = MathUtils.degToRad(75);
    this.controls.enablePan = false;

    domElement.addEventListener("click", this.onClick.bind(this))

  }

  initActions(actionConfig: ActionConfig) {
    return new ActionManager(actionConfig, this)
  }

  initTriggers(actionTriggerConfig: ActionTriggerConfig) {
    return new TriggerManager(actionTriggerConfig, this)
  }

  getChildByName(name: string) {
    return this.children.find((child) => child.name);
  }

  getGroupNameForType(type: string) {
    return `${type}Group`
  }

  addToScene(object: Object3D, type?: string) {
    if (type) {
      let parent = this.getChildByName(this.getGroupNameForType(type))
      if (!parent) {
        parent = new Group()
        parent.name = this.getGroupNameForType(type);
        this.add(parent);
      }
      parent.add(object);
    } else {
      this.add(object);
    }
  }

  removeFromScene(object: Object3D) {
    if (object.parent != this) {
      const parent = object.parent;
      parent?.remove(object);
      if (parent?.children?.length === 0) {
        parent.parent?.remove(parent);
      }
    } else {
      this.remove(object);
    }
  }

  addRenderStep(renderStep: RenderStep) {
    this.otherRenders.push(renderStep);
  }
  removeRenderStep(renderStep: RenderStep) {
    this.otherRenders = this.otherRenders.filter((r) => r.scene === renderStep.scene && r.camera === renderStep.renderer && r.renderer === renderStep.renderer)
  }

  onClick(event: MouseEvent) {
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
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
    TWEEN.update(time);
    // if (this.object) {
    // //   this.object.rotation.x = time / 2000;
    //   this.object.rotation.y = time / 1000;
    // }
  }
}
