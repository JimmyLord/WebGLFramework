import { AnimationSetData } from "../datatypes/animation.js";
import { Material } from "../datatypes/material.js";
import { SpriteSheet } from "../datatypes/spritesheet.js";
import { Mesh } from "../gl/mesh.js";
import { Shader } from "../gl/shader.js";
import { Texture } from "../gl/texture.js";

export class ResourceManager
{
    shaders: { [key: string]: Shader } = {};
    materials: { [key: string]: Material } = {};
    meshes: { [key: string]: Mesh } = {};
    textures: { [key: string]: Texture } = {};
    spritesheets: { [key: string]: SpriteSheet } = {};
    animations: { [key: string]: AnimationSetData } = {};
    
    constructor(gl: WebGL2RenderingContext)
    {
        this.createSomeShaders( gl );
    }

    free()
    {
        for( let key in this.shaders ) { this.shaders[key].free(); delete this.shaders[key]; };
        for( let key in this.materials ) { this.materials[key].free(); delete this.materials[key]; };
        for( let key in this.meshes ) { this.meshes[key].free(); delete this.meshes[key]; };
        for( let key in this.textures ) { this.textures[key].free(); delete this.textures[key]; };
        for( let key in this.spritesheets ) { this.spritesheets[key].free(); delete this.spritesheets[key]; };
        for( let key in this.animations ) { this.animations[key].free(); delete this.animations[key]; };
    }

    createSomeShaders(gl: WebGL2RenderingContext)
    {
        let shaderSourceMediumP = `
            precision mediump float;
        `;

        let shaderSourceLightFunctions = `
            vec3 calculatePointLightContribution(vec3 materialColor, vec3 surfacePos, vec3 normal, vec3 camPos, vec3 lightPos, vec3 lightColor, float radius)
            {
                vec3 dirToLight = lightPos - surfacePos;
                vec3 shortenedDir = dirToLight / radius;
                float attenuation = max( 0.0, 1.0 - dot( shortenedDir, shortenedDir ) );
                dirToLight = normalize( dirToLight );

                // Diffuse.
                float diffusePerc = max( 0.0, dot( normal, dirToLight ) );
                diffusePerc *= attenuation;
                vec3 diffuseColor = materialColor * lightColor * diffusePerc;

                // Specular
                vec3 dirToCamera = camPos - surfacePos;
                dirToCamera = normalize( dirToCamera );
                vec3 halfVector = (dirToCamera + dirToLight) / 2.0;
                float specularPerc = max( 0.0, dot( normal, halfVector ) );
                specularPerc = pow( specularPerc, 50.0 );
                specularPerc *= attenuation;
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
            uniform vec4 u_UVTransform; // xy = scale, zw = offset.

            varying vec2 v_UV;
            varying vec4 v_Color;
            varying vec3 v_WSNormal;
            varying vec3 v_WSPosition;

            void main()
            {
                gl_Position = u_MatProj * u_MatView * u_MatWorld * a_Position;

                v_UV = a_UV * u_UVTransform.xy + u_UVTransform.zw;
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
            uniform float u_LightRadius[4];
            
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
                                    u_CameraPosition, u_LightPosition[i], u_LightColor[i], u_LightRadius[i] );
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
            uniform float u_LightRadius[4];

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
                                    u_CameraPosition, u_LightPosition[i], u_LightColor[i], u_LightRadius[i] );
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
