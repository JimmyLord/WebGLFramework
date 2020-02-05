class Mesh
{
    constructor(gl)
    {
        this.m_gl = gl;
        this.m_VBO = null;
    }

    createTriangle(size)
    {
        var gl = this.m_gl;

        var numVerts = 3;
        var sizeofFloat32 = 4;
        var vertexPositions = [ -size.x/2,-size.y/2,0,   0,size.y/2,0,   size.x/2,-size.y/2,0, ];
        var vertexUVs = [ 0,0,   0.5,1,   1,0, ];

        var vertexAttributes = new ArrayBuffer( numVerts * 5 * sizeofFloat32 );
        var vertexAttributesAsFloats = new Float32Array( vertexAttributes );
        for( var i=0; i<numVerts; i++ )
        {
            vertexAttributesAsFloats[i*5 + 0] = vertexPositions[i*3 + 0];
            vertexAttributesAsFloats[i*5 + 1] = vertexPositions[i*3 + 1];
            vertexAttributesAsFloats[i*5 + 2] = vertexPositions[i*3 + 2];
            vertexAttributesAsFloats[i*5 + 3] = vertexUVs[i*2 + 0];
            vertexAttributesAsFloats[i*5 + 4] = vertexUVs[i*2 + 1];
        }

        this.m_VBO = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, this.m_VBO );
        gl.bufferData( gl.ARRAY_BUFFER, vertexAttributes, gl.STATIC_DRAW );
    }

    free()
    {
        var gl = this.m_gl;

        if( this.m_VBO == null )
            return;

        // Manually resize buffer to 1 byte to reduce memory usage on shutdown.
        gl.bindBuffer( gl.ARRAY_BUFFER, this.m_VBO );
        gl.bufferData( gl.ARRAY_BUFFER, 1, gl.STATIC_DRAW );
        gl.bindBuffer( gl.ARRAY_BUFFER, null );
        gl.deleteBuffer( this.m_VBO )

        this.m_VBO = null;
        this.m_gl = null;

        //log( "Freed mesh." );
    }

    draw(material, world)
    {
        var gl = this.m_gl;

        if( this.m_VBO == null )
            return;

        // Setup VBO and attributes.
        gl.bindBuffer( gl.ARRAY_BUFFER, this.m_VBO );

        var a_Position = gl.getAttribLocation( material.m_shader.program, "a_Position" );
        gl.enableVertexAttribArray( a_Position );
        gl.vertexAttribPointer( a_Position, 3, gl.FLOAT, false, 5*4, 0 )

        var a_UV = gl.getAttribLocation( material.m_shader.program, "a_UV" );
        if( a_UV != null )
        {
            gl.enableVertexAttribArray( a_UV );
            gl.vertexAttribPointer( a_UV, 2, gl.FLOAT, false, 5*4, 12 )
        }

        // Setup shader and uniforms.
        gl.useProgram( material.m_shader.program );

        var u_WorldMatrix = gl.getUniformLocation( material.m_shader.program, "u_WorldMatrix" );
        gl.uniformMatrix4fv( u_WorldMatrix, false, world.values )

        var u_Color = gl.getUniformLocation( material.m_shader.program, "u_Color" );
        gl.uniform4f( u_Color, material.m_color.r, material.m_color.g, material.m_color.b, material.m_color.a );

        var u_TextureAlbedo = gl.getUniformLocation( material.m_shader.program, "u_TextureAlbedo" );
        if( u_TextureAlbedo != null )
        {
            var textureUnit = 0;
            gl.activeTexture( gl.TEXTURE0 + textureUnit );
            gl.bindTexture( gl.TEXTURE_2D, material.m_texture.m_textureID );
            gl.uniform1i( u_TextureAlbedo, textureUnit );
        }

        // Draw.
        gl.drawArrays( gl.TRIANGLES, 0, 3 );
    }
}
