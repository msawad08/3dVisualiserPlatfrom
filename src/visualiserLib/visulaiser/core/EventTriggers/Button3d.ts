import { Camera, Color, Euler, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, Quaternion, Vector3 } from "three";
import { EventTrigger, EventTriggerParams } from "./EventTrigger";
import { CSS3DObject, CSS3DRenderer, CSS3DSprite } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { AppScene } from "../scene";



type Button3dParams = {
    position: Vector3;
    rotation: Quaternion|Vector3|Euler;
    parent: Object3D;
    attachToObject?: string;

} & EventTriggerParams;

export class Button3d  extends EventTrigger{

    private static renderer?: CSS3DRenderer;
    private static instances: Button3d[] = [];

    object: Object3D;
    
    constructor(params: Button3dParams){
        const {rotation, position, ...other} = params; 
        super(other);
        this.type = "Button3d";
        this.object = this.create(params);
    }

    create({rotation, position, scene, attachToObject}: Button3dParams){
        const object = new Button3dObject({name: `Button3d:${this.name}`, camera: scene.camera, onClickListener: this.onTrigger})
        object.position.copy(position);
        if("w" in rotation || rotation instanceof Quaternion){
            object.quaternion.copy(rotation);
        }else if("order" in rotation || rotation instanceof Euler){
            object.rotation.copy(rotation);
        }else{
            object.rotation.setFromVector3(rotation);
        }
        object.scale.set(0.01, 0.01, 0.01);
        Button3d.initRenderer(this, scene);
        let parent;
        if(attachToObject){
            parent = scene.getObjectByName(attachToObject)
        } 
        if(parent) parent.attach(object);
        else scene.addToScene(object, this.type);
        return object;
    }

    private static initRenderer(instance: Button3d, scene: AppScene){
        if(!this.renderer){
            this.renderer = new CSS3DRenderer()
            this.renderer.setSize( window.innerWidth, window.innerHeight );
            this.renderer.domElement.style.position = 'absolute';
            this.renderer.domElement.style.top = "0";
            this.renderer.domElement.style.pointerEvents = "none";
            // this.renderer.domElement.style.zIndex = "999";
            document.body.appendChild( this.renderer.domElement );
            scene.addRenderStep({renderer: this.renderer});
        }
        this.instances.push(instance);
        return this.renderer;
    }

    private static disposeInstance(instance: Button3d, scene: AppScene){
        this.instances = this.instances.filter((i)=> i !== instance);
        if(this.instances.length === 0){
            scene.removeRenderStep({renderer: this.renderer});
        }
        this.renderer = undefined;
    }



    dispose(): void {
        Button3d.disposeInstance(this, this.scene);
        super.dispose()
    }
}


class Button3dObject extends CSS3DObject{

    private camera: Camera;
    private onClickListener: Function;

    constructor({name, camera, onClickListener}: {name: string, camera: Camera, onClickListener: Function}){
        super(Button3dObject.htmlElement);
        this.camera = camera;
        this.name = name;
        this.onClickListener = onClickListener;
        this.element.addEventListener("click", this.onClick);
    }

    onClick = () => {
        this.onClickListener()
    }

    // updateMatrixWorld(force?: boolean | undefined): void {

    //     super.updateMatrixWorld();
    // }


    private static get htmlElement(){
        const div = document.createElement("button");
        div.id = `HTMLElement-Button3d-${this.name}`
        div.setAttribute("style", `
            width: 10px;
            height: 10px;
            border-radius: 100%;
            border: 1px solid white;
            background-color: #4CAF50;
            color: white;
            font-size: 8px;
            font-weight: 800;
            padding: 0;
            pointer-events:all;
            backface-visibility: hidden;
        `)
        div.innerHTML = `<span>+</span>

        `
        return div;
    }
}

