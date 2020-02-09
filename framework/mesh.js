class Mesh
{
    constructor(gl)
    {
        this.m_gl = gl;
        this.m_VBO = null;
        this.m_IBO = null;
        this.m_numVerts = 0;
        this.m_numIndices = 0;
        this.m_primitiveType = gl.POINTS;
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

        // Manually resize buffer to 1 byte to reduce memory usage on shutdown.
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.m_IBO );
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, 1, gl.STATIC_DRAW );
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, null );
        gl.deleteBuffer( this.m_IBO )

        this.m_VBO = null;
        this.m_IBO = null;
        this.m_gl = null;
    }

    createTriangle(size)
    {
        var gl = this.m_gl;

        var numVerts = 3;
        var sizeofFloat32 = 4;
        var sizeofUint8 = 1;
        var vertexPositions = [ -size.x/2,-size.y/2,0,   0,size.y/2,0,   size.x/2,-size.y/2,0, ];
        var vertexUVs = [ 0,0,   0.5,1,   1,0, ];

        // VertexFormat: XYZ UV RGBA. (5 floats + 4 uint8s or 6 floats or 24 bytes)
        var sizeofVertex = (5*sizeofFloat32 + 4*sizeofUint8);
        var vertexAttributes = new ArrayBuffer( numVerts * sizeofVertex );
        var vertexAttributesAsFloats = new Float32Array( vertexAttributes );
        for( var i=0; i<numVerts; i++ )
        {
            vertexAttributesAsFloats[i*6 + 0] = vertexPositions[i*3 + 0];
            vertexAttributesAsFloats[i*6 + 1] = vertexPositions[i*3 + 1];
            vertexAttributesAsFloats[i*6 + 2] = vertexPositions[i*3 + 2];
            vertexAttributesAsFloats[i*6 + 3] = vertexUVs[i*2 + 0];
            vertexAttributesAsFloats[i*6 + 4] = vertexUVs[i*2 + 1];
        }

        this.m_VBO = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, this.m_VBO );
        gl.bufferData( gl.ARRAY_BUFFER, vertexAttributes, gl.STATIC_DRAW );

        this.m_numVerts = 3;
        this.m_primitiveType = gl.TRIANGLES;
    }

    createCube(size)
    {
        var gl = this.m_gl;

        var numVerts = 24;
        var numIndices = 36;
        var sizeofFloat32 = 4;
        var sizeofUint8 = 1;
        var sizeofUnsignedShort = 2;
        var vertexPositionsAndUVs = [
                // Front
                -size.x/2, -size.y/2, -size.z/2, 0, 0,   0, 0, 128, 255,
                -size.x/2,  size.y/2, -size.z/2, 0, 1,   0, 0, 128, 255,
                 size.x/2,  size.y/2, -size.z/2, 1, 1,   0, 0, 128, 255,
                 size.x/2, -size.y/2, -size.z/2, 1, 0,   0, 0, 128, 255,
                // Back
                -size.x/2, -size.y/2,  size.z/2, 0, 0,   0, 0, 255, 255,
                -size.x/2,  size.y/2,  size.z/2, 0, 1,   0, 0, 255, 255,
                 size.x/2,  size.y/2,  size.z/2, 1, 1,   0, 0, 255, 255,
                 size.x/2, -size.y/2,  size.z/2, 1, 0,   0, 0, 255, 255,
                // Left
                -size.x/2, -size.y/2, -size.z/2, 0, 0,   128, 0, 0, 255,
                -size.x/2,  size.y/2, -size.z/2, 0, 1,   128, 0, 0, 255,
                -size.x/2,  size.y/2,  size.z/2, 1, 1,   128, 0, 0, 255,
                -size.x/2, -size.y/2,  size.z/2, 1, 0,   128, 0, 0, 255,
                // Right
                 size.x/2, -size.y/2, -size.z/2, 0, 0,   255, 0, 0, 255,
                 size.x/2,  size.y/2, -size.z/2, 0, 1,   255, 0, 0, 255,
                 size.x/2,  size.y/2,  size.z/2, 1, 1,   255, 0, 0, 255,
                 size.x/2, -size.y/2,  size.z/2, 1, 0,   255, 0, 0, 255,
                // Top
                -size.x/2,  size.y/2, -size.z/2, 0, 0,   0, 255, 0, 255,
                -size.x/2,  size.y/2,  size.z/2, 0, 1,   0, 255, 0, 255,
                 size.x/2,  size.y/2,  size.z/2, 1, 1,   0, 255, 0, 255,
                 size.x/2,  size.y/2, -size.z/2, 1, 0,   0, 255, 0, 255,
                // Bottom
                -size.x/2, -size.y/2, -size.z/2, 0, 0,   0, 128, 0, 255,
                -size.x/2, -size.y/2,  size.z/2, 0, 1,   0, 128, 0, 255,
                 size.x/2, -size.y/2,  size.z/2, 1, 1,   0, 128, 0, 255,
                 size.x/2, -size.y/2, -size.z/2, 1, 0,   0, 128, 0, 255,
            ];

        var indices = [
                 0, 1, 2,  0, 2, 3,
                 4, 6, 5,  4, 7, 6,
                 8,10, 9,  8,11,10,
                12,13,14, 12,14,15,
                16,17,18, 16,18,19,
                20,22,21, 20,23,22,
            ];

        // VertexFormat: XYZ UV RGBA. (5 floats + 4 uint8s or 6 floats or 24 bytes)
        var sizeofVertex = (5*sizeofFloat32 + 4*sizeofUint8);
        var vertexAttributes = new ArrayBuffer( numVerts * sizeofVertex );
        var vertexAttributesAsFloats = new Float32Array( vertexAttributes );
        for( var i=0; i<numVerts; i++ )
        {
            vertexAttributesAsFloats[i*6 + 0] = vertexPositionsAndUVs[i*9 + 0];
            vertexAttributesAsFloats[i*6 + 1] = vertexPositionsAndUVs[i*9 + 1];
            vertexAttributesAsFloats[i*6 + 2] = vertexPositionsAndUVs[i*9 + 2];
            vertexAttributesAsFloats[i*6 + 3] = vertexPositionsAndUVs[i*9 + 3];
            vertexAttributesAsFloats[i*6 + 4] = vertexPositionsAndUVs[i*9 + 4];
        }

        var vertexAttributesAsUint8s = new Uint8Array( vertexAttributes );
        for( var i=0; i<numVerts; i++ )
        {
            vertexAttributesAsUint8s[i*sizeofVertex + 5*4 + 0] = vertexPositionsAndUVs[i*9 + 5];
            vertexAttributesAsUint8s[i*sizeofVertex + 5*4 + 1] = vertexPositionsAndUVs[i*9 + 6];
            vertexAttributesAsUint8s[i*sizeofVertex + 5*4 + 2] = vertexPositionsAndUVs[i*9 + 7];
            vertexAttributesAsUint8s[i*sizeofVertex + 5*4 + 3] = vertexPositionsAndUVs[i*9 + 8];
        }

        // Indices: Uint16.
        var indices16 = new ArrayBuffer( numIndices * sizeofUnsignedShort );
        var indicesAsUint16s = new Uint16Array( indices16 );
        for( var i=0; i<numIndices; i++ )
        {
            indicesAsUint16s[i] = indices[i];
        }

        this.m_VBO = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, this.m_VBO );
        gl.bufferData( gl.ARRAY_BUFFER, vertexAttributes, gl.STATIC_DRAW );

        this.m_IBO = gl.createBuffer();
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.m_IBO );
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, indices16, gl.STATIC_DRAW );

        this.m_numVerts = numVerts;
        this.m_numIndices = numIndices;
        this.m_primitiveType = gl.TRIANGLES;
    }

    createCircle(numSides, radius)
    {
        var gl = this.m_gl;

        var numVerts = numSides;
        var sizeofFloat32 = 4;
        var sizeofUint8 = 1;

        // VertexFormat: XYZ UV RGBA. (5 floats + 4 uint8s or 6 floats or 24 bytes)
        var sizeofVertex = (5*sizeofFloat32 + 4*sizeofUint8);
        var vertexAttributes = new ArrayBuffer( numVerts * sizeofVertex );
        var vertexAttributesAsFloats = new Float32Array( vertexAttributes );
        var sliceRadians = -2*Math.PI / numVerts;
        for( var i=0; i<numVerts; i++ )
        {
            vertexAttributesAsFloats[i*6 + 0] = Math.cos( sliceRadians * i ) * radius;
            vertexAttributesAsFloats[i*6 + 1] = Math.sin( sliceRadians * i ) * radius;
            vertexAttributesAsFloats[i*6 + 2] = 0;
            vertexAttributesAsFloats[i*6 + 3] = Math.cos( sliceRadians * i );
            vertexAttributesAsFloats[i*6 + 4] = Math.sin( sliceRadians * i );
        }

        this.m_VBO = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, this.m_VBO );
        gl.bufferData( gl.ARRAY_BUFFER, vertexAttributes, gl.STATIC_DRAW );

        this.m_numVerts = numVerts;
        this.m_primitiveType = gl.TRIANGLE_FAN;
    }

    draw(camera, matWorld, material)
    {
        var gl = this.m_gl;

        if( this.m_VBO == null )
            return;

        // Setup VBO and attributes.
        gl.bindBuffer( gl.ARRAY_BUFFER, this.m_VBO );
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.m_IBO );

        var vertexSize = 5*4 + 1*4;

        var a_Position = gl.getAttribLocation( material.m_shader.program, "a_Position" );
        gl.enableVertexAttribArray( a_Position );
        gl.vertexAttribPointer( a_Position, 3, gl.FLOAT, false, vertexSize, 0 )

        var a_UV = gl.getAttribLocation( material.m_shader.program, "a_UV" );
        if( a_UV != -1 )
        {
            gl.enableVertexAttribArray( a_UV );
            gl.vertexAttribPointer( a_UV, 2, gl.FLOAT, false, vertexSize, 12 )
        }

        var a_Color = gl.getAttribLocation( material.m_shader.program, "a_Color" );
        if( a_Color != -1 )
        {
            gl.enableVertexAttribArray( a_Color );
            gl.vertexAttribPointer( a_Color, 4, gl.UNSIGNED_BYTE, true, vertexSize, 20 )
        }

        // Setup shader and uniforms.
        gl.useProgram( material.m_shader.program );

        var u_MatWorld = gl.getUniformLocation( material.m_shader.program, "u_MatWorld" );
        gl.uniformMatrix4fv( u_MatWorld, false, matWorld.m )

        var u_MatView = gl.getUniformLocation( material.m_shader.program, "u_MatView" );
        gl.uniformMatrix4fv( u_MatView, false, camera.m_matView.m )

        var u_MatProj = gl.getUniformLocation( material.m_shader.program, "u_MatProj" );
        gl.uniformMatrix4fv( u_MatProj, false, camera.m_matProj.m )

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
        if( this.m_numIndices == 0 )
            gl.drawArrays( this.m_primitiveType, 0, this.m_numVerts );
        else
            gl.drawElements( this.m_primitiveType, this.m_numIndices, gl.UNSIGNED_SHORT, 0 );

        if( a_UV != -1 )
            gl.disableVertexAttribArray( a_UV );
        if( a_Color != -1 )
            gl.disableVertexAttribArray( a_Color );
    }
}
