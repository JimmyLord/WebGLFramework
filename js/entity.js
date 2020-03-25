class Entity
{
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
        let matWorld = new mat4;
        matWorld.setIdentity();
        matWorld.createSRT( this.scale, this.rotation, this.position );

        this.mesh.draw( camera, matWorld, this.material, lights );
    }
}
