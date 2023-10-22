// Define global defaults for material properties.
let material_defaultUVTransform = new vec4(1,1,0,0); // xy = scale, zw = offset.

class Material
{
    constructor(shader, color, texture, uvTransform = material_defaultUVTransform)
    {
        this.shader = shader;
        this.uvTransform = uvTransform;
        this.color = color;
        this.texture = texture;
    }

    free()
    {
        this.shader = null;
        this.uvTransform = null;
        this.color = null;
        this.texture = null;
    }
}
