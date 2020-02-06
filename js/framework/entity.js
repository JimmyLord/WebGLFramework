class Entity
{
    constructor(position, mesh, material)
    {
        this.m_position = position;
        this.m_mesh = mesh;
        this.m_material = material;
    }

    free()
    {
        this.m_position = null;
        this.m_mesh = null;
        this.m_material = null;
    }

    draw(camera)
    {
        var matWorld = new mat4;
        matWorld.setIdentity();
        matWorld.translate( this.m_position );

        this.m_mesh.draw( camera, matWorld, this.m_material );
    }
}
