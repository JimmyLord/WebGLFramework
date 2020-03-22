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
        let generalVertShaderSource = `
            attribute vec4 a_Position;
            attribute vec2 a_UV;
            attribute vec3 a_Normal;
            attribute vec4 a_Color;

            uniform mat4 u_MatWorld;
            uniform mat4 u_MatView;
            uniform mat4 u_MatProj;

            varying vec2 v_UV;
            varying vec4 v_Color;
            varying vec3 v_WSNormal;
            varying vec3 v_WSPosition;

            void main()
            {
                gl_Position = u_MatProj * u_MatView * u_MatWorld * a_Position;

                v_UV = a_UV;
                v_Color = a_Color;
                v_WSNormal = (u_MatWorld * vec4(a_Normal, 0)).xyz; // TODO: Pass in a rotation matrix.
                v_WSPosition = (u_MatWorld * a_Position).xyz;
            }
        `;

        let uniformColorFragShaderSource = `
            precision mediump float;
            
            uniform vec4 u_Color;

            void main()
            {
                gl_FragColor = u_Color;
            }
        `;

        let vertexColorFragShaderSource = `
            precision mediump float;
            
            varying vec4 v_Color;

            void main()
            {
                gl_FragColor = v_Color;
            }
        `;

        let textureFragShaderSource = `
            precision mediump float;
            
            uniform sampler2D u_TextureAlbedo;

            varying vec2 v_UV;

            void main()
            {
                gl_FragColor = texture2D( u_TextureAlbedo, v_UV );
            }
        `;

        let uniformColorLitFragShaderSource = `
            precision mediump float;
            
            uniform vec4 u_Color;
            uniform vec3 u_LightPosition[4];
            uniform vec3 u_LightColor[4];
            
            varying vec3 v_WSNormal;
            varying vec3 v_WSPosition;

            void main()
            {
                vec3 normal = normalize( v_WSNormal );

                vec3 lightDir = u_LightPosition[0] - v_WSPosition;
                float distance = length( lightDir );

                lightDir = normalize( lightDir );
                float diffusePerc = dot( normal, lightDir );
                diffusePerc /= distance;

                gl_FragColor = vec4( u_Color.xyz * u_LightColor[0] * diffusePerc, 1 );

                // Debug.
                //gl_FragColor = vec4( v_WSNormal, 1 );
            }
        `;

        let vertexColorLitFragShaderSource = `
            precision mediump float;
            
            uniform vec3 u_LightPosition[4];
            uniform vec3 u_LightColor[4];

            varying vec4 v_Color;
            varying vec3 v_WSNormal;
            varying vec3 v_WSPosition;

            void main()
            {
                vec3 normal = normalize( v_WSNormal );

                vec3 lightDir = u_LightPosition[0] - v_WSPosition;
                float distance = length( lightDir );

                lightDir = normalize( lightDir );
                float diffusePerc = dot( normal, lightDir );
                diffusePerc /= distance;

                gl_FragColor = vec4( v_Color.rgb * u_LightColor[0] * diffusePerc, 1 );

                // Debug.
                //gl_FragColor = vec4( v_WSNormal, 1 );
            }
        `;

        this.shaders["uniformColor"] = new Shader( gl, generalVertShaderSource, uniformColorFragShaderSource );
        this.shaders["vertexColor"] = new Shader( gl, generalVertShaderSource, vertexColorFragShaderSource );
        this.shaders["texture"] = new Shader( gl, generalVertShaderSource, textureFragShaderSource );
        this.shaders["uniformColorLit"] = new Shader( gl, generalVertShaderSource, uniformColorLitFragShaderSource );
        this.shaders["vertexColorLit"] = new Shader( gl, generalVertShaderSource, vertexColorLitFragShaderSource );
    }
}
