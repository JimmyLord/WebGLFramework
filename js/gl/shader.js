class Shader
{
    constructor(gl, vertSource, fragSource)
    {
        // Attribute and uniform locations.
        this.a_Position = null;
        this.a_UV = null;
        this.a_Normal = null;
        this.a_Color = null;

        this.u_MatWorld = null;
        this.u_MatView = null;
        this.u_MatProj = null;
        this.u_Color = null;

        this.u_TextureAlbedo = null;

        // Lights.
        this.maxLights = 16;
        this.u_LightPos = new Array( this.maxLights );
        this.u_LightColor = new Array( this.maxLights );
        this.u_LightRadius = new Array( this.maxLights );
        for( let i=0; i<this.maxLights; i++ )
        {
            this.u_LightPos[i] = null;
            this.u_LightColor[i] = null;
            this.u_LightRadius[i] = null;
        }

        this.u_CameraPosition = null;

        this.gl = gl;
        this.vertShader = this.createShader( gl.VERTEX_SHADER, vertSource );
        this.fragShader = this.createShader( gl.FRAGMENT_SHADER, fragSource );
        this.program = this.createProgram( this.vertShader, this.fragShader );
        this.cacheAttributeAndUniformLocations( this.program );
    }
    
    free()
    {
        let gl = this.gl;

        gl.deleteShader( this.vertShader );
        gl.deleteShader( this.fragShader );
        gl.deleteProgram( this.program );

        this.gl = null;
        this.vertShader = null;
        this.fragShader = null;
        this.program = null;
    }

    createShader(type, source)
    {
        let gl = this.gl;

        let shader = gl.createShader( type );
        gl.shaderSource( shader, source );
        gl.compileShader( shader );
        let success = gl.getShaderParameter( shader, gl.COMPILE_STATUS );
        if( success === false )
        {
            console.log( gl.getShaderInfoLog( shader ) );
            gl.deleteShader( shader );
        }
        return shader;
    }
    
    createProgram(vertShader, fragShader)
    {
        let gl = this.gl;
        
        let program = gl.createProgram();
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

        return program;
    }

    cacheAttributeAndUniformLocations(program)
    {
        if( program === null )
            return;

        let gl = this.gl;

        this.a_Position = gl.getAttribLocation( program, "a_Position" );
        this.a_UV = gl.getAttribLocation( program, "a_UV" );
        this.a_Normal = gl.getAttribLocation( program, "a_Normal" );
        this.a_Color = gl.getAttribLocation( program, "a_Color" );

        this.u_MatWorld = gl.getUniformLocation( program, "u_MatWorld" );
        this.u_MatView = gl.getUniformLocation( program, "u_MatView" );
        this.u_MatProj = gl.getUniformLocation( program, "u_MatProj" );
        this.u_Color = gl.getUniformLocation( program, "u_Color" );

        this.u_TextureAlbedo = gl.getUniformLocation( program, "u_TextureAlbedo" );

        // Lights.
        for( let i=0; i<this.maxLights; i++ )
        {
            this.u_LightPos[i] = gl.getUniformLocation( program, "u_LightPosition[" + i + "]" );
            this.u_LightColor[i] = gl.getUniformLocation( program, "u_LightColor[" + i + "]" );
            this.u_LightRadius[i] = gl.getUniformLocation( program, "u_LightRadius[" + i + "]" );
        }

        this.u_CameraPosition = gl.getUniformLocation( program, "u_CameraPosition" );
    }
}
