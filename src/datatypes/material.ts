// Define global defaults for material properties.
let material_defaultUVTransform = new vec4(1,1,0,0); // xy = scale, zw = offset.

class Material
{
    shader: Shader;
    uvTransform: vec4;
    col: color;
    texture: Texture | null = null;

    constructor(shader: Shader, col: color, texture: Texture | null = null, uvTransform: vec4 = material_defaultUVTransform)
    {
        this.shader = shader;
        this.uvTransform = uvTransform;
        this.col = col;
        this.texture = texture;
    }

    free()
    {
    }
}
