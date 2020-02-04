class Material
{
    constructor(shader, color)
    {
        this.m_shader = shader;
        this.m_color = color;
    }

    free()
    {
        this.m_shader = null;
        this.m_color = null;
    }
}
