class Entity
{
    constructor(position, rotation, mesh, material)
    {
        this.position = position;
        this.rotation = rotation;
        this.scale = new vec3( 1 );
        this.mesh = mesh;
        this.material = material;
    }

    free()
    {
        this.position = null;
        this.mesh = null;
        this.material = null;
    }

    draw(camera)
    {
        let matWorld = new mat4;
        matWorld.setIdentity();
        matWorld.createSRT( this.scale, this.rotation, this.position );

        this.mesh.draw( camera, matWorld, this.material );
    }
}
