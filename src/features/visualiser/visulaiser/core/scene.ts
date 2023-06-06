import  {
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
  BoxGeometry,
  BackSide,
  Float32BufferAttribute,
} from "three";
import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransitionMaterial } from "../materials/transitionMaterial"
import { Reflector } from "./reflector";
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';


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
    path: process.env.PUBLIC_URL + "/3dModels/toyota_supra_mk4/scene.gltf",
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
  textureLoader: TextureLoader;

  raycaster = new Raycaster();
  pointer = new Vector2();

  constructor({ sceneConfig, cameraConfig, modelConfig, canvas }: ConfigTypes) {
    super();
    this.background = sceneConfig?.background;
    this.camera = this.initCamera({
      ...defaultConfig.cameraConfig,
      ...(cameraConfig ?? {}),
    });
    this.textureLoader = new TextureLoader();
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
    const ambientLight = new AmbientLight(new Color("white"), 0.3 );
    this.add(ambientLight);
    const directionalLight = new DirectionalLight( 0xffffff, 0.4 );
    directionalLight.position.set(10,10,0);
    directionalLight.castShadow = true;
    this.add( directionalLight );

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
      const materials : Record<string, Material> = {};
      gltf.scene.traverse((child: Object3D)=>{
        if(child instanceof Mesh){
          child.castShadow = true;
          const material = ((child as Mesh).material) as Material;
          if(material){
              materials[material.uuid] = material;
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

      if(this.controls){
        this.controls.maxDistance = radius * 3;
        this.controls.minDistance = radius;
      }


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
    const environment = new Group()

    // create Floor
    const geometry = new PlaneGeometry(15   , 15);
    const material = new MeshPhysicalMaterial({
      color: new Color("White"),
      opacity: 0.1,
    });
    material.alphaMap = await this.textureLoader.loadAsync(`${process.env.PUBLIC_URL}/3dModels/env/basic/alpha-fog.png`);
    material.transparent = true;
    // const mesh = new Mesh(geometry, material);
    const mesh = new Reflector(geometry, material);
    mesh.renderOrder = 5;
    mesh.rotateX(-Math.PI/2);
    mesh.receiveShadow = true;
    environment.add(mesh);

    const exr = await (new EXRLoader().loadAsync(`${process.env.PUBLIC_URL}/3dModels/env/outdoor/wide_street_02_4k.exr`));
    this.environment = exr;
    const height = 6, width = 15;
    const domeGeometry =  new CylinderGeometry(width/2,width/2, height)
    const dome = new Mesh(
      domeGeometry,
      new MeshBasicMaterial({map: exr, side: BackSide}),
    )
    dome.position.y += height/2 - 0.1;
    dome.renderOrder  = 1;


    const temp = new Vector2();

    // const positionAttribute = sphere.geometry.getAttribute('position');
    // const uvAttribute = new Float32BufferAttribute(new Float32Array(positionAttribute.count * 2), 2);
    // sphere.geometry.setAttribute('uv', uvAttribute);

    // for (let i = 0; i < positionAttribute.count; i++) {
    //   const vertex = new Vector3();
    //   vertex.fromBufferAttribute(positionAttribute, i);
    //   let u = temp.set(vertex.x,vertex.z).angle()/Math.PI/2;
    //   if(vertex.y === -height) u = temp.set(vertex.x,vertex.z).length()/width * 0.25;
    //   else if(vertex.y === height) u = 0.75 + temp.set(vertex.x,vertex.z).length()/width * 0.25;
    //   else u =  0.25 + (vertex.y + height)/(height*2) * 0.5;

    //   let v = 0;
    //   uvAttribute.setXY(i, u, v);
    // }

    const positionAttribute = dome.geometry.getAttribute('position');
    const uvAttribute = new Float32BufferAttribute(new Float32Array(positionAttribute.count * 2), 2);
    dome.geometry.setAttribute('uv', uvAttribute);
    let floorUV = 0.3;
    let us = [];
    for (let i = 0; i < positionAttribute.count; i++) {
      const vertex = new Vector3();
      vertex.fromBufferAttribute(positionAttribute, i);

      const theta = Math.atan2(vertex.x, -vertex.z);
      // const u = temp.set(vertex.x,vertex.z).angle()/Math.PI/2;
      
      const u = (theta + Math.PI) / (2 * Math.PI);
      // us.push(u);/
      
      let v = floorUV + ((vertex.y + height / 2) / height) * (1 - floorUV*2);
      if(vertex.y === -height/2){
        v = vertex.x === 0 && vertex.z == 0 ? 0: floorUV;
      }
      else if(vertex.y === height/2){
        v = vertex.x === 0 && vertex.z == 0  ? 1.0: 1-floorUV;
         
      }
      uvAttribute.setXY(i, u, v);
    }
    // console.log("U Max and Min", Math.max(...us), Math.min(...us), us.length, us);
    environment.add(dome);

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

  async loadTexture(path: string, {repeat}:{repeat?: Vector2} = {}) : Promise<Texture>{
    const texture = await this.textureLoader.loadAsync(`${process.env.PUBLIC_URL}/${path}`);
    texture.wrapS = texture.wrapT = RepeatWrapping;
    repeat && texture.repeat.copy(repeat);
    return texture
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
