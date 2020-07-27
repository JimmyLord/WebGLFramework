class Entity
{
    // Temp vars to avoid GC.
    static matWorld = new mat4;

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
        Entity.matWorld.setIdentity();
        Entity.matWorld.createSRT( this.scale, this.rotation, this.position );

        this.mesh.draw( camera, Entity.matWorld, this.material, lights );
    }
}
