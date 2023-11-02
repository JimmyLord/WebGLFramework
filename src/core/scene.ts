import { color } from "../datatypes/color.js";
import { Light } from "../datatypes/light.js";
import { Material } from "../datatypes/material.js";
import { vec3 } from "../datatypes/vector.js";
import { Mesh } from "../gl/mesh.js";
import { Camera } from "./camera.js";
import { Entity } from "./entity.js";
import { FrameworkMain } from "./frameworkMain.js";

export class Scene
{
    framework: FrameworkMain;
    entities: Entity[] = [];
    lights: Light[];
    camera: Camera;
    orthoHeight: number;

    constructor(framework: FrameworkMain, camera: Camera | null = null)
    {
        this.framework = framework;
        this.entities = [];
        this.lights = [];
        this.orthoHeight = 0;

        // Create a default camera if one isn't made before the call to init.
        if( camera == null )
        {
            this.orthoHeight = 2;
            this.camera = new Camera( new vec3(0, 0, -3), true, this.orthoHeight, this.framework );
        }
        else
        {
            this.camera = camera;
        }
    }

    init(loadDefaultResources: boolean)
    {
        if( loadDefaultResources && this.framework.resources && this.framework.gl )
        {
            let resources = this.framework.resources;
            let gl = this.framework.gl;

            resources.meshes["triangle"] = new Mesh( gl );
            resources.meshes["triangle"].createTriangle( 0.5, 0.5 );
            resources.meshes["circle"] = new Mesh( gl );
            resources.meshes["circle"].createCircle( 200, 0.2 );
            resources.meshes["cube"] = new Mesh( gl );
            resources.meshes["cube"].createCube( 1, 1, 1 );
            resources.meshes["rectangle"] = new Mesh( gl );
            resources.meshes["rectangle"].createBox( 1, 1 );

            //resources.textures["testTexture"] = new Texture( gl );
            //resources.textures["testTexture"].loadFromFile( "data/textures/test.png" );

            resources.materials["red"] = new Material( resources.shaders["uniformColor"], new color( 1, 0, 0, 1 ), null );
            resources.materials["green"] = new Material( resources.shaders["uniformColor"], new color( 0, 1, 0, 1 ), null );
            resources.materials["blue"] = new Material( resources.shaders["uniformColor"], new color( 0, 0, 1, 1 ), null );
            resources.materials["white"] = new Material( resources.shaders["uniformColor"], new color( 1, 1, 1, 1 ), null );
            //resources.materials["testTexture"] = new Material( resources.shaders["texture"], new color( 0, 0, 0, 1 ), resources.textures["testTexture"] );
            resources.materials["vertexColor"] = new Material( resources.shaders["vertexColor"], new color( 1, 1, 1, 1 ), null );

            resources.materials["redLit"] = new Material( resources.shaders["uniformColorLit"], new color( 1, 0, 0, 1 ), null );
            resources.materials["greenLit"] = new Material( resources.shaders["uniformColorLit"], new color( 0, 1, 0, 1 ), null );
            resources.materials["blueLit"] = new Material( resources.shaders["uniformColorLit"], new color( 0, 0, 1, 1 ), null );
            resources.materials["whiteLit"] = new Material( resources.shaders["uniformColorLit"], new color( 1, 1, 1, 1 ), null );
            resources.materials["vertexColorLit"] = new Material( resources.shaders["vertexColorLit"], new color( 1, 1, 1, 1 ), null );
        }
    }

    shutdown()
    {
        this.entities.forEach( entity => entity.free() );
        this.entities.length = 0;
        this.entities = [];

        if( this.camera )
        {
            this.camera.free();
        }
    }

    update(deltaTime: number, currentTime: number)
    {
        if( this.camera )
        {
            this.camera.desiredHeight = this.orthoHeight;
            this.camera.update( deltaTime );
        }
    }

    draw(camera: Camera)
    {
        this.entities.forEach( entity => entity.draw( camera, this.lights ) );
    }

    add(entity: Entity)
    {
        this.entities.push( entity );
    }

    onResize()
    {
        if( this.camera )
        {
            this.camera.onResize();
        }
    }
}
