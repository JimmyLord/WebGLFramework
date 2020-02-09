class Material
{
    constructor(shader, color, texture)
    {
        this.m_shader = shader;
        this.m_color = color;
        this.m_texture = texture;
    }

    free()
    {
        this.m_shader = null;
        this.m_color = null;
        this.m_texture = null;
    }
}
