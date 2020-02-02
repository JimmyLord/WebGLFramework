class Mesh
{
    constructor(gl)
    {
        this.m_gl = gl;

        var numVerts = 3;
        var sizeofFloat32 = 4;
        var vertexPositions = [ -0.5, -0.5,   0.0, 0.5,   0.5, -0.5, ];

        var vertexAttributes = new ArrayBuffer( numVerts * 2 * sizeofFloat32 );
        var vertexAttributesAsFloats = new Float32Array( vertexAttributes );
        for( var i=0; i<numVerts*2; i++ )
        {
            vertexAttributesAsFloats[i] = vertexPositions[i];
        }

        this.m_VBO = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, this.m_VBO );
        gl.bufferData( gl.ARRAY_BUFFER, vertexAttributes, gl.STATIC_DRAW );

        //log( "Data buffered = " + this.m_VBO )
    }

    free()
    {
        var gl = this.m_gl;

        gl.deleteBuffer( this.m_VBO )
        //log( "Freed mesh." );
    }

    draw(shader)
    {
        var gl = this.m_gl;

        // Setup VBO and attributes.
        gl.bindBuffer( gl.ARRAY_BUFFER, this.m_VBO );

        var a_Position = gl.getAttribLocation( shader.program, "a_Position" );
        gl.enableVertexAttribArray( a_Position );
        gl.vertexAttribPointer( a_Position, 2, gl.FLOAT, false, 0, 0 )

        // Setup shader and uniforms.
        gl.useProgram( shader.program );

        // Draw.
        gl.drawArrays( gl.TRIANGLES, 0, 3 );
    }
}
