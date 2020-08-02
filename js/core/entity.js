class Entity
{
    // Temp vars to avoid GC.
    // Temp moved to bottom of file as globals until closure compiler supports static properties.
    //static matWorld = new mat4();

    constructor(position, rotation, scale, mesh, material)
    {
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
        this.mesh = mesh;
        this.material = material;
    }

    free()
    {
        this.position = null;
        this.mesh = null;
        this.material = null;
    }

    draw(camera, lights)
    {
        Entity_matWorld.setIdentity();
        Entity_matWorld.createSRT( this.scale, this.rotation, this.position );

        this.mesh.draw( camera, Entity_matWorld, this.material, lights );
    }
}

let Entity_matWorld = new mat4();
