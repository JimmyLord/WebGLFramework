class ResourceManager
{
    constructor(gl)
    {
        this.m_Shaders = new Map;
        this.m_Materials = new Map;
        this.m_Meshes = new Map;

        this.createSomeShaders( gl );
    }

    free()
    {
        this.m_Shaders.foreach( shader => shader.free() );
        this.m_Shaders.clear();
        this.m_Shaders = null;

        this.m_Materials.foreach( material => material.free() );
        this.m_Materials.clear();
        this.m_Materials = null;

        this.m_Meshes.foreach( mesh => mesh.free() );
        this.m_Meshes.clear();
        this.m_Meshes = null;
    }

    createSomeShaders(gl)
    {
        var generalVertShaderSource = `
            attribute vec4 a_Position;

            uniform mat4 u_WorldMatrix;

            void main()
            {
                gl_Position = u_WorldMatrix * a_Position;
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

        this.m_Shaders["color"] = new Shader( gl, generalVertShaderSource, colorFragShaderSource );
    }
}
