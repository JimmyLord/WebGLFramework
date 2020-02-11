class ResourceManager
{
    constructor(gl)
    {
        this.shaders = new Map;
        this.materials = new Map;
        this.meshes = new Map;
        this.textures = new Map;

        this.createSomeShaders( gl );
    }

    free()
    {
        this.shaders.forEach( shader => shader.free() );
        this.shaders.clear();
        this.shaders = null;

        this.materials.forEach( material => material.free() );
        this.materials.clear();
        this.materials = null;

        this.meshes.forEach( mesh => mesh.free() );
        this.meshes.clear();
        this.meshes = null;

        this.textures.forEach( texture => texture.free() );
        this.textures.clear();
        this.textures = null;
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

        this.shaders["uniformColor"] = new Shader( gl, generalVertShaderSource, uniformColorFragShaderSource );
        this.shaders["vertexColor"] = new Shader( gl, generalVertShaderSource, vertexColorFragShaderSource );
        this.shaders["texture"] = new Shader( gl, generalVertShaderSource, textureFragShaderSource );
    }
}
