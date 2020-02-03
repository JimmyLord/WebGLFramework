class Entity
{
    constructor(position, mesh, material)
    {
        this.m_position = position;
        this.m_mesh = mesh;
        this.m_material = material;
    }

    draw()
    {
        var worldMat = new mat4;
        worldMat.setIdentity();
        worldMat.translate( this.m_position );

        this.m_mesh.draw( this.m_material.m_shader, worldMat );
    }
}
