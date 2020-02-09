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
            attribute vec4 a_Color;

            uniform mat4 u_MatWorld;
            uniform mat4 u_MatView;
            uniform mat4 u_MatProj;

            varying vec2 v_UV;
            varying vec4 v_Color;

            void main()
            {
                gl_Position = u_MatProj * u_MatView * u_MatWorld * a_Position;
                v_UV = a_UV;
                v_Color = a_Color;
            }
        `;

        var uniformColorFragShaderSource = `
            precision mediump float;
            
            uniform vec4 u_Color;

            void main()
            {
                gl_FragColor = u_Color;
            }
        `;

        var vertexColorFragShaderSource = `
            precision mediump float;
            
            varying vec4 v_Color;

            void main()
            {
                gl_FragColor = v_Color;
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

        this.m_shaders["uniformColor"] = new Shader( gl, generalVertShaderSource, uniformColorFragShaderSource );
        this.m_shaders["vertexColor"] = new Shader( gl, generalVertShaderSource, vertexColorFragShaderSource );
        this.m_shaders["texture"] = new Shader( gl, generalVertShaderSource, textureFragShaderSource );
    }
}
