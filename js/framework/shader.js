class Shader
{
    constructor(gl, vertSource, fragSource)
    {
        this.m_gl = gl;
        this.m_vertShader = this.createShader( gl.VERTEX_SHADER, vertSource );
        this.m_fragShader = this.createShader( gl.FRAGMENT_SHADER, fragSource );
        this.m_program = this.createProgram( this.m_vertShader, this.m_fragShader );

        //log( "Shader created: program = " + shader.program );
    }

    get program()
    {
        return this.m_program;
    }
    
    free()
    {
        var gl = this.m_gl;

        gl.deleteShader( this.m_vertShader );
        gl.deleteShader( this.m_fragShader );
        gl.deleteProgram( this.m_program );

        this.m_gl = null;
        this.m_vertShader = null;
        this.m_fragShader = null;
        this.m_program = null;
    }

    createShader(type, source)
    {
        var gl = this.m_gl;

        var shader = gl.createShader( type );
        gl.shaderSource( shader, source );
        gl.compileShader( shader );
        var success = gl.getShaderParameter( shader, gl.COMPILE_STATUS );
        if( success == false )
        {
            log( gl.getShaderInfoLog( shader ) );
            gl.deleteShader( shader );
        }
        return shader;
    }
    
    createProgram(vertShader, fragShader)
    {
        var gl = this.m_gl;
        
        var program = gl.createProgram();
        gl.attachShader( program, vertShader );
        gl.attachShader( program, fragShader );
        gl.linkProgram( program );
        var success = gl.getProgramParameter( program, gl.LINK_STATUS );
        if( success == false )
        {
            log( gl.getProgramInfoLog( program ) );
            gl.deleteProgram( program );
        }       
        return program;
    }
}
