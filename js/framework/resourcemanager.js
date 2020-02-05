class ResourceManager
{
    constructor(gl)
    {
        this.m_shaders = new Map;
        this.m_materials = new Map;
        this.m_meshes = new Map;
        this.m_textures = new Map;

        this.createSomeShaders( gl );
    }

    free()
    {
        this.m_shaders.forEach( shader => shader.free() );
        this.m_shaders.clear();
        this.m_shaders = null;

        this.m_materials.forEach( material => material.free() );
        this.m_materials.clear();
        this.m_materials = null;

        this.m_meshes.forEach( mesh => mesh.free() );
        this.m_meshes.clear();
        this.m_meshes = null;

        this.m_textures.forEach( texture => texture.free() );
        this.m_textures.clear();
        this.m_textures = null;
    }

    createSomeShaders(gl)
    {
        var generalVertShaderSource = `
            attribute vec4 a_Position;
            attribute vec2 a_UV;

            uniform mat4 u_WorldMatrix;

            varying vec2 v_UV;

            void main()
            {
                gl_Position = u_WorldMatrix * a_Position;
                v_UV = a_UV;
            }
        `;

        var colorFragShaderSource = `
            precision mediump float;
            
            uniform vec4 u_Color;

            void main()
            {
                gl_FragColor = u_Color;
            }
        `;

        var textureFragShaderSource = `
            precision mediump float;
            
            uniform sampler2D u_TextureAlbedo;

            varying vec2 v_UV;

            void main()
            {
                gl_FragColor = texture2D( u_TextureAlbedo, v_UV );
            }
        `;

        this.m_shaders["color"] = new Shader( gl, generalVertShaderSource, colorFragShaderSource );
        this.m_shaders["texture"] = new Shader( gl, generalVertShaderSource, textureFragShaderSource );
    }
}
