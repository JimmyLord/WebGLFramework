class Shader
{
    constructor(gl, vertSource, fragSource)
    {
        this.gl = gl;
        this.vertShader = this.createShader( gl.VERTEX_SHADER, vertSource );
        this.fragShader = this.createShader( gl.FRAGMENT_SHADER, fragSource );
        this.program = this.createProgram( this.vertShader, this.fragShader );
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
        if( success == false )
        {
            log( gl.getShaderInfoLog( shader ) );
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
        if( success == false )
        {
            log( gl.getProgramInfoLog( program ) );
            gl.deleteProgram( program );
        }       
        return program;
    }
}
