class Material
{
    constructor(shader, color, texture)
    {
        this.shader = shader;
        this.color = color;
        this.texture = texture;
    }

    free()
    {
        this.shader = null;
        this.color = null;
        this.texture = null;
    }
}
