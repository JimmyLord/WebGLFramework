namespace fw
{
    // Define global defaults for material properties.
    let material_defaultUVTransform = new vec4(1,1,0,0); // xy = scale, zw = offset.

    export class Material
    {
        shader: Shader;
        uvTransform: vec4;
        color: color;
        texture: Texture | null = null;

        constructor(shader: Shader, color: color, texture: Texture | null = null, uvTransform: vec4 = material_defaultUVTransform)
        {
            this.shader = shader;
            this.uvTransform = uvTransform;
            this.color = color;
            this.texture = texture;
        }

        free()
        {
        }

        clone(): Material
        {
            return new Material( this.shader, this.color.clone(), this.texture, this.uvTransform.clone() );
        }
    }
}
