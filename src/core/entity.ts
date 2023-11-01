import { Light } from "../datatypes/light.js";
import { Material } from "../datatypes/material.js";
import { mat4 } from "../datatypes/matrix.js";
import { vec3 } from "../datatypes/vector.js";
import { Mesh } from "../gl/mesh.js";
import { Camera } from "./camera.js";

export class Entity
{
    // Temp vars to avoid GC.
    // Temp moved to bottom of file as globals until closure compiler supports static properties.
    //static matWorld = new mat4();

    position: vec3;
    rotation: vec3;
    scale: vec3;
    mesh: Mesh;
    material: Material;

    constructor(position: vec3, rotation: vec3, scale: vec3, mesh: Mesh, material: Material)
    {
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
        this.mesh = mesh;
        this.material = material;
    }

    free()
    {
    }

    draw(camera: Camera, lights: Light[])
    {
        if( this.mesh == null ) return;
        
        Entity_matWorld.setIdentity();
        Entity_matWorld.createSRT( this.scale, this.rotation, this.position );

        this.mesh.draw( camera, Entity_matWorld, this.material, lights );
    }
}

let Entity_matWorld = new mat4();
