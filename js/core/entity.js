class Entity
{
    constructor(position, rotation, scale, mesh, material)
    {
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
        this.mesh = mesh;
        this.material = material;
        
        // Temp vars to avoid GC.
        this.matWorld = new mat4;
    }

    free()
    {
        this.position = null;
        this.mesh = null;
        this.material = null;
    }

    draw(camera, lights)
    {
        matWorld.setIdentity();
        matWorld.createSRT( this.scale, this.rotation, this.position );

        this.mesh.draw( camera, matWorld, this.material, lights );
    }
}
