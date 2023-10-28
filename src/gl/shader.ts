namespace fw
{
    export class Shader
    {
        a_Position: number;
        a_UV: number;
        a_Normal: number;
        a_Color: number;

        u_MatWorld: WebGLUniformLocation | null = null;
        u_MatView: WebGLUniformLocation | null = null;
        u_MatProj: WebGLUniformLocation | null = null;
        u_UVTransform: WebGLUniformLocation | null = null;
        u_Color: WebGLUniformLocation | null = null;

        u_TextureAlbedo: WebGLUniformLocation | null = null;

        // Lights.
        maxLights: number;
        u_LightPos: Array<WebGLUniformLocation | null> | null = null;
        u_LightColor: Array<WebGLUniformLocation | null> | null = null;
        u_LightRadius: Array<WebGLUniformLocation | null> | null = null;

        u_CameraPosition: WebGLUniformLocation | null = null;

        gl: WebGL2RenderingContext;
        vertShader: WebGLShader | null = null;
        fragShader: WebGLShader | null = null;
        program: WebGLProgram | null = null;

        constructor(gl: WebGL2RenderingContext, vertSource: string, fragSource: string)
        {
            // Attribute and uniform locations.
            this.a_Position = -1;
            this.a_UV = -1;
            this.a_Normal = -1;
            this.a_Color = -1;

            this.u_MatWorld = null;
            this.u_MatView = null
            this.u_MatProj = null
            this.u_UVTransform = null
            this.u_Color = null

            this.u_TextureAlbedo = null

            // Lights.
            this.maxLights = 16;
            this.u_LightPos = new Array( this.maxLights );
            this.u_LightColor = new Array( this.maxLights );
            this.u_LightRadius = new Array( this.maxLights );
            for( let i=0; i<this.maxLights; i++ )
            {
                this.u_LightPos[i] = null
                this.u_LightColor[i] = null
                this.u_LightRadius[i] = null
            }

            this.u_CameraPosition = null

            this.gl = gl;
            this.vertShader = this.createShader( gl.VERTEX_SHADER, vertSource );
            this.fragShader = this.createShader( gl.FRAGMENT_SHADER, fragSource );
            if( this.vertShader && this.fragShader )
            {
                this.program = this.createProgram( this.vertShader, this.fragShader );
                if( this.program )
                {
                    this.cacheAttributeAndUniformLocations( this.program );
                }
            }
        }
        
        free()
        {
            let gl = this.gl;

            gl.deleteShader( this.vertShader );
            gl.deleteShader( this.fragShader );
            gl.deleteProgram( this.program );

            this.vertShader = null;
            this.fragShader = null;
            this.program = null;
        }

        createShader(type: number, source: string)
        {
            let gl = this.gl;

            let shader = gl.createShader( type );
            if( shader )
            {
                gl.shaderSource( shader, source );
                gl.compileShader( shader );
                let success = gl.getShaderParameter( shader, gl.COMPILE_STATUS );
                if( success === false )
                {
                    console.log( gl.getShaderInfoLog( shader ) );
                    gl.deleteShader( shader );
                }
            }
            return shader;
        }
        
        createProgram(vertShader: WebGLShader, fragShader: WebGLShader)
        {
            let gl = this.gl;
            
            let program = gl.createProgram();
            if( program )
            {
                gl.attachShader( program, vertShader );
                gl.attachShader( program, fragShader );
                gl.linkProgram( program );
                
                let success = gl.getProgramParameter( program, gl.LINK_STATUS );
                if( success === false )
                {
                    console.log( gl.getProgramInfoLog( program ) );
                    gl.deleteProgram( program );
                    program = null;
                }
            }

            return program;
        }

        cacheAttributeAndUniformLocations(program: WebGLProgram)
        {
            if( program == null )
                return;

            let gl = this.gl;

            this.a_Position = gl.getAttribLocation( program, "a_Position" );
            this.a_UV = gl.getAttribLocation( program, "a_UV" );
            this.a_Normal = gl.getAttribLocation( program, "a_Normal" );
            this.a_Color = gl.getAttribLocation( program, "a_Color" );

            this.u_MatWorld = gl.getUniformLocation( program, "u_MatWorld" );
            this.u_MatView = gl.getUniformLocation( program, "u_MatView" );
            this.u_MatProj = gl.getUniformLocation( program, "u_MatProj" );
            this.u_UVTransform = gl.getUniformLocation( program, "u_UVTransform" );
            this.u_Color = gl.getUniformLocation( program, "u_Color" );

            this.u_TextureAlbedo = gl.getUniformLocation( program, "u_TextureAlbedo" );

            // Lights.
            for( let i=0; i<this.maxLights; i++ )
            {
                if( this.u_LightPos && this.u_LightColor && this.u_LightRadius )
                {
                    this.u_LightPos[i] = gl.getUniformLocation( program, "u_LightPosition[" + i + "]" );
                    this.u_LightColor[i] = gl.getUniformLocation( program, "u_LightColor[" + i + "]" );
                    this.u_LightRadius[i] = gl.getUniformLocation( program, "u_LightRadius[" + i + "]" );
                }
            }

            this.u_CameraPosition = gl.getUniformLocation( program, "u_CameraPosition" );
        }
    }
}
