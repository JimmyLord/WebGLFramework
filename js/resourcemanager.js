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
        let shaderSourceMediumP = `
            precision mediump float;
        `;

        let shaderSourceLightFunctions = `
            vec3 calculatePointLightContribution(vec3 materialColor, vec3 surfacePos, vec3 normal, vec3 camPos, vec3 lightPos, vec3 lightColor)
            {
                vec3 dirToLight = lightPos - surfacePos;
                float distance = length( dirToLight );
                dirToLight = normalize( dirToLight );

                // Diffuse.
                float diffusePerc = max( 0.0, dot( normal, dirToLight ) );
                diffusePerc /= distance;
                vec3 diffuseColor = materialColor * lightColor * diffusePerc;

                // Specular
                vec3 dirToCamera = camPos - surfacePos;
                dirToCamera = normalize( dirToCamera );
                vec3 halfVector = (dirToCamera + dirToLight) / 2.0;
                float specularPerc = max( 0.0, dot( normal, halfVector ) );
                specularPerc /= distance;
                specularPerc = pow( specularPerc, 50.0 );
                vec3 specularColor = lightColor * specularPerc;

                return diffuseColor + specularColor;
            }
        `;

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
            uniform vec4 u_Color;

            void main()
            {
                gl_FragColor = u_Color;
            }
        `;

        let vertexColorFragShaderSource = `
            varying vec4 v_Color;

            void main()
            {
                gl_FragColor = v_Color;
            }
        `;

        let textureFragShaderSource = `
            uniform sampler2D u_TextureAlbedo;

            varying vec2 v_UV;

            void main()
            {
                gl_FragColor = texture2D( u_TextureAlbedo, v_UV );
            }
        `;

        let uniformColorLitFragShaderSource = `
            uniform vec4 u_Color;
            uniform vec3 u_CameraPosition;
            uniform vec3 u_LightPosition[4];
            uniform vec3 u_LightColor[4];
            
            varying vec3 v_WSNormal;
            varying vec3 v_WSPosition;

            void main()
            {
                vec3 materialColor = u_Color.xyz;
                vec3 normal = normalize( v_WSNormal );

                vec3 finalColor = vec3(0,0,0);

                for( int i=0; i<4; i++ )
                {
                    finalColor += calculatePointLightContribution( materialColor, v_WSPosition, normal,
                                      u_CameraPosition, u_LightPosition[i], u_LightColor[i] );
                }

                gl_FragColor = vec4( finalColor, 1 );

                // Debug.
                //gl_FragColor = vec4( v_WSNormal, 1 );
                //gl_FragColor = vec4( u_CameraPosition, 1 );
            }
        `;

        let vertexColorLitFragShaderSource = `
            uniform vec3 u_CameraPosition;
            uniform vec3 u_LightPosition[4];
            uniform vec3 u_LightColor[4];

            varying vec4 v_Color;
            varying vec3 v_WSNormal;
            varying vec3 v_WSPosition;

            void main()
            {
                vec3 materialColor = v_Color.rgb;
                vec3 normal = normalize( v_WSNormal );

                vec3 finalColor = vec3(0,0,0);

                for( int i=0; i<4; i++ )
                {
                    finalColor += calculatePointLightContribution( materialColor, v_WSPosition, normal,
                                      u_CameraPosition, u_LightPosition[i], u_LightColor[i] );
                }

                gl_FragColor = vec4( finalColor, 1 );

                // Debug.
                //gl_FragColor = vec4( v_WSNormal, 1 );
                //gl_FragColor = vec4( u_CameraPosition, 1 );
            }
        `;

        this.shaders["uniformColor"]    = new Shader( gl, shaderSourceMediumP + generalVertShaderSource, shaderSourceMediumP + uniformColorFragShaderSource );
        this.shaders["vertexColor"]     = new Shader( gl, shaderSourceMediumP + generalVertShaderSource, shaderSourceMediumP + vertexColorFragShaderSource );
        this.shaders["texture"]         = new Shader( gl, shaderSourceMediumP + generalVertShaderSource, shaderSourceMediumP + textureFragShaderSource );
        this.shaders["uniformColorLit"] = new Shader( gl, shaderSourceMediumP + generalVertShaderSource, shaderSourceMediumP + shaderSourceLightFunctions + uniformColorLitFragShaderSource );
        this.shaders["vertexColorLit"]  = new Shader( gl, shaderSourceMediumP + generalVertShaderSource, shaderSourceMediumP + shaderSourceLightFunctions + vertexColorLitFragShaderSource );
    }
}
