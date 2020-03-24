class Mesh
{
    constructor(gl)
    {
        this.gl = gl;
        this.VBO = null;
        this.IBO = null;
        this.numVerts = 0;
        this.numIndices = 0;
        this.primitiveType = gl.POINTS;
    }

    free()
    {
        let gl = this.gl;

        if( this.VBO == null )
            return;

        // Manually resize buffer to 1 byte to reduce memory usage on shutdown.
        gl.bindBuffer( gl.ARRAY_BUFFER, this.VBO );
        gl.bufferData( gl.ARRAY_BUFFER, 1, gl.STATIC_DRAW );
        gl.bindBuffer( gl.ARRAY_BUFFER, null );
        gl.deleteBuffer( this.VBO )

        // Manually resize buffer to 1 byte to reduce memory usage on shutdown.
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.IBO );
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, 1, gl.STATIC_DRAW );
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, null );
        gl.deleteBuffer( this.IBO )

        this.VBO = null;
        this.IBO = null;
        this.gl = null;
    }

    createTriangle(size)
    {
        let gl = this.gl;

        let numVerts = 3;
        let sizeofFloat32 = 4;
        let sizeofUint8 = 1;
        let vertexPositions = [ -size.x/2,-size.y/2,0,   0,size.y/2,0,   size.x/2,-size.y/2,0, ];
        let vertexUVs = [ 0,0,   0.5,1,   1,0, ];

        // VertexFormat: XYZ UV XYZ RGBA. (8 floats + 4 uint8s or 9 floats or 36 bytes)
        let sizeofVertex = (8*sizeofFloat32 + 4*sizeofUint8);
        let vertexAttributes = new ArrayBuffer( numVerts * sizeofVertex );
        let vertexAttributesAsFloats = new Float32Array( vertexAttributes );
        for( let i=0; i<numVerts; i++ )
        {
            vertexAttributesAsFloats[i*9 + 0] = vertexPositions[i*3 + 0];
            vertexAttributesAsFloats[i*9 + 1] = vertexPositions[i*3 + 1];
            vertexAttributesAsFloats[i*9 + 2] = vertexPositions[i*3 + 2];
            vertexAttributesAsFloats[i*9 + 3] = vertexUVs[i*2 + 0];
            vertexAttributesAsFloats[i*9 + 4] = vertexUVs[i*2 + 1];
            vertexAttributesAsFloats[i*9 + 5] = 0;
            vertexAttributesAsFloats[i*9 + 6] = 0;
            vertexAttributesAsFloats[i*9 + 7] = -1;
        }

        this.VBO = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, this.VBO );
        gl.bufferData( gl.ARRAY_BUFFER, vertexAttributes, gl.STATIC_DRAW );

        this.numVerts = 3;
        this.primitiveType = gl.TRIANGLES;
    }

    createBox(size)
    {
        let gl = this.gl;

        let numVerts = 4;
        let numIndices = 6;
        let sizeofFloat32 = 4;
        let sizeofUint8 = 1;
        let sizeofUnsignedShort = 2;
        let vertexPosUVColor = [
                -size.x/2, -size.y/2, 0,    0, 0,   0, 0, 128, 255,
                -size.x/2,  size.y/2, 0,    0, 1,   0, 0, 128, 255,
                 size.x/2,  size.y/2, 0,    1, 1,   0, 0, 128, 255,
                 size.x/2, -size.y/2, 0,    1, 0,   0, 0, 128, 255,
            ];

        let indices = [
                 0, 1, 2,  0, 2, 3,
            ];

        // VertexFormat: XYZ UV XYZ RGBA. (8 floats + 4 uint8s or 9 floats or 36 bytes)
        let sizeofVertex = (8*sizeofFloat32 + 4*sizeofUint8);
        let vertexAttributes = new ArrayBuffer( numVerts * sizeofVertex );
        let vertexAttributesAsFloats = new Float32Array( vertexAttributes );
        for( let i=0; i<numVerts; i++ )
        {
            vertexAttributesAsFloats[i*9 + 0] = vertexPosUVColor[i*9 + 0];
            vertexAttributesAsFloats[i*9 + 1] = vertexPosUVColor[i*9 + 1];
            vertexAttributesAsFloats[i*9 + 2] = vertexPosUVColor[i*9 + 2];
            vertexAttributesAsFloats[i*9 + 3] = vertexPosUVColor[i*9 + 3];
            vertexAttributesAsFloats[i*9 + 4] = vertexPosUVColor[i*9 + 4];
            vertexAttributesAsFloats[i*9 + 5] = 0;
            vertexAttributesAsFloats[i*9 + 6] = 0;
            vertexAttributesAsFloats[i*9 + 7] = -1;
        }

        let vertexAttributesAsUint8s = new Uint8Array( vertexAttributes );
        for( let i=0; i<numVerts; i++ )
        {
            vertexAttributesAsUint8s[i*sizeofVertex + 8*4 + 0] = vertexPosUVColor[i*9 + 5];
            vertexAttributesAsUint8s[i*sizeofVertex + 8*4 + 1] = vertexPosUVColor[i*9 + 6];
            vertexAttributesAsUint8s[i*sizeofVertex + 8*4 + 2] = vertexPosUVColor[i*9 + 7];
            vertexAttributesAsUint8s[i*sizeofVertex + 8*4 + 3] = vertexPosUVColor[i*9 + 8];
        }

        // Indices: Uint16.
        let indices16 = new ArrayBuffer( numIndices * sizeofUnsignedShort );
        let indicesAsUint16s = new Uint16Array( indices16 );
        for( let i=0; i<numIndices; i++ )
        {
            indicesAsUint16s[i] = indices[i];
        }

        this.VBO = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, this.VBO );
        gl.bufferData( gl.ARRAY_BUFFER, vertexAttributes, gl.STATIC_DRAW );

        this.IBO = gl.createBuffer();
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.IBO );
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, indices16, gl.STATIC_DRAW );

        this.numVerts = numVerts;
        this.numIndices = numIndices;
        this.primitiveType = gl.TRIANGLES;
    }

    createCube(size)
    {
        let gl = this.gl;

        let numVerts = 24;
        let numIndices = 36;
        let sizeofFloat32 = 4;
        let sizeofUint8 = 1;
        let sizeofUnsignedShort = 2;
        let vertexPosUVNormalColor = [
                // Front
                -size.x/2, -size.y/2, -size.z/2,   0,0,   0,0,-1,   0,0,128,255,
                -size.x/2,  size.y/2, -size.z/2,   0,1,   0,0,-1,   0,0,128,255,
                 size.x/2,  size.y/2, -size.z/2,   1,1,   0,0,-1,   0,0,128,255,
                 size.x/2, -size.y/2, -size.z/2,   1,0,   0,0,-1,   0,0,128,255,
                // Back
                -size.x/2, -size.y/2,  size.z/2,   0,0,   0,0,1,    0,0,255,255,
                -size.x/2,  size.y/2,  size.z/2,   0,1,   0,0,1,    0,0,255,255,
                 size.x/2,  size.y/2,  size.z/2,   1,1,   0,0,1,    0,0,255,255,
                 size.x/2, -size.y/2,  size.z/2,   1,0,   0,0,1,    0,0,255,255,
                // Left
                -size.x/2, -size.y/2, -size.z/2,   0,0,   -1,0,0,   128,0,0,255,
                -size.x/2,  size.y/2, -size.z/2,   0,1,   -1,0,0,   128,0,0,255,
                -size.x/2,  size.y/2,  size.z/2,   1,1,   -1,0,0,   128,0,0,255,
                -size.x/2, -size.y/2,  size.z/2,   1,0,   -1,0,0,   128,0,0,255,
                // Right
                 size.x/2, -size.y/2, -size.z/2,   0,0,   1,0,0,    255,0,0,255,
                 size.x/2,  size.y/2, -size.z/2,   0,1,   1,0,0,    255,0,0,255,
                 size.x/2,  size.y/2,  size.z/2,   1,1,   1,0,0,    255,0,0,255,
                 size.x/2, -size.y/2,  size.z/2,   1,0,   1,0,0,    255,0,0,255,
                // Top
                -size.x/2,  size.y/2, -size.z/2,   0,0,   0,1,0,    0,255,0,255,
                -size.x/2,  size.y/2,  size.z/2,   0,1,   0,1,0,    0,255,0,255,
                 size.x/2,  size.y/2,  size.z/2,   1,1,   0,1,0,    0,255,0,255,
                 size.x/2,  size.y/2, -size.z/2,   1,0,   0,1,0,    0,255,0,255,
                // Bottom
                -size.x/2, -size.y/2, -size.z/2,   0,0,   0,-1,0,   0,128,0,255,
                -size.x/2, -size.y/2,  size.z/2,   0,1,   0,-1,0,   0,128,0,255,
                 size.x/2, -size.y/2,  size.z/2,   1,1,   0,-1,0,   0,128,0,255,
                 size.x/2, -size.y/2, -size.z/2,   1,0,   0,-1,0,   0,128,0,255,
            ];

        let indices = [
                 0, 1, 2,  0, 2, 3,
                 4, 6, 5,  4, 7, 6,
                 8,10, 9,  8,11,10,
                12,13,14, 12,14,15,
                16,17,18, 16,18,19,
                20,22,21, 20,23,22,
            ];

        // VertexFormat: XYZ UV XYZ RGBA. (8 floats + 4 uint8s or 9 floats or 36 bytes)
        let sizeofVertex = (8*sizeofFloat32 + 4*sizeofUint8);
        let vertexAttributes = new ArrayBuffer( numVerts * sizeofVertex );
        let vertexAttributesAsFloats = new Float32Array( vertexAttributes );
        for( let i=0; i<numVerts; i++ )
        {
            vertexAttributesAsFloats[i*9 + 0] = vertexPosUVNormalColor[i*12 + 0];
            vertexAttributesAsFloats[i*9 + 1] = vertexPosUVNormalColor[i*12 + 1];
            vertexAttributesAsFloats[i*9 + 2] = vertexPosUVNormalColor[i*12 + 2];
            vertexAttributesAsFloats[i*9 + 3] = vertexPosUVNormalColor[i*12 + 3];
            vertexAttributesAsFloats[i*9 + 4] = vertexPosUVNormalColor[i*12 + 4];
            vertexAttributesAsFloats[i*9 + 5] = vertexPosUVNormalColor[i*12 + 5];
            vertexAttributesAsFloats[i*9 + 6] = vertexPosUVNormalColor[i*12 + 6];
            vertexAttributesAsFloats[i*9 + 7] = vertexPosUVNormalColor[i*12 + 7];
        }

        let vertexAttributesAsUint8s = new Uint8Array( vertexAttributes );
        for( let i=0; i<numVerts; i++ )
        {
            vertexAttributesAsUint8s[i*sizeofVertex + 8*4 + 0] = vertexPosUVNormalColor[i*12 + 8];
            vertexAttributesAsUint8s[i*sizeofVertex + 8*4 + 1] = vertexPosUVNormalColor[i*12 + 9];
            vertexAttributesAsUint8s[i*sizeofVertex + 8*4 + 2] = vertexPosUVNormalColor[i*12 + 10];
            vertexAttributesAsUint8s[i*sizeofVertex + 8*4 + 3] = vertexPosUVNormalColor[i*12 + 11];
        }

        // Indices: Uint16.
        let indices16 = new ArrayBuffer( numIndices * sizeofUnsignedShort );
        let indicesAsUint16s = new Uint16Array( indices16 );
        for( let i=0; i<numIndices; i++ )
        {
            indicesAsUint16s[i] = indices[i];
        }

        this.VBO = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, this.VBO );
        gl.bufferData( gl.ARRAY_BUFFER, vertexAttributes, gl.STATIC_DRAW );

        this.IBO = gl.createBuffer();
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.IBO );
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, indices16, gl.STATIC_DRAW );

        this.numVerts = numVerts;
        this.numIndices = numIndices;
        this.primitiveType = gl.TRIANGLES;
    }

    createCircle(numSides, radius)
    {
        let gl = this.gl;

        let numVerts = numSides;
        let sizeofFloat32 = 4;
        let sizeofUint8 = 1;

        // VertexFormat: XYZ UV XYZ RGBA. (8 floats + 4 uint8s or 9 floats or 36 bytes)
        let sizeofVertex = (8*sizeofFloat32 + 4*sizeofUint8);
        let vertexAttributes = new ArrayBuffer( numVerts * sizeofVertex );
        let vertexAttributesAsFloats = new Float32Array( vertexAttributes );
        let sliceRadians = -2*Math.PI / numVerts;
        for( let i=0; i<numVerts; i++ )
        {
            vertexAttributesAsFloats[i*9 + 0] = Math.cos( sliceRadians * i ) * radius;
            vertexAttributesAsFloats[i*9 + 1] = Math.sin( sliceRadians * i ) * radius;
            vertexAttributesAsFloats[i*9 + 2] = 0;
            vertexAttributesAsFloats[i*9 + 3] = Math.cos( sliceRadians * i );
            vertexAttributesAsFloats[i*9 + 4] = Math.sin( sliceRadians * i );
            vertexAttributesAsFloats[i*9 + 5] = 0;
            vertexAttributesAsFloats[i*9 + 6] = 0;
            vertexAttributesAsFloats[i*9 + 7] = -1;
        }

        this.VBO = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, this.VBO );
        gl.bufferData( gl.ARRAY_BUFFER, vertexAttributes, gl.STATIC_DRAW );

        this.numVerts = numVerts;
        this.primitiveType = gl.TRIANGLE_FAN;
    }

    draw(camera, matWorld, material, lights)
    {
        let gl = this.gl;

        if( this.VBO == null )
            return;

        // Set up VBO and attributes.
        gl.bindBuffer( gl.ARRAY_BUFFER, this.VBO );
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.IBO );

        let vertexSize = (3+2+3)*4 + 4*1; // (Pos, UV, Normal) + Color

        let a_Position = gl.getAttribLocation( material.shader.program, "a_Position" );
        gl.enableVertexAttribArray( a_Position );
        gl.vertexAttribPointer( a_Position, 3, gl.FLOAT, false, vertexSize, 0 )

        let a_UV = gl.getAttribLocation( material.shader.program, "a_UV" );
        if( a_UV != -1 )
        {
            gl.enableVertexAttribArray( a_UV );
            gl.vertexAttribPointer( a_UV, 2, gl.FLOAT, false, vertexSize, 12 )
        }

        let a_Normal = gl.getAttribLocation( material.shader.program, "a_Normal" );
        if( a_Normal != -1 )
        {
            gl.enableVertexAttribArray( a_Normal );
            gl.vertexAttribPointer( a_Normal, 3, gl.FLOAT, false, vertexSize, 20 )
        }

        let a_Color = gl.getAttribLocation( material.shader.program, "a_Color" );
        if( a_Color != -1 )
        {
            gl.enableVertexAttribArray( a_Color );
            gl.vertexAttribPointer( a_Color, 4, gl.UNSIGNED_BYTE, true, vertexSize, 32 )
        }

        // Set up shader and uniforms.
        gl.useProgram( material.shader.program );

        let u_MatWorld = gl.getUniformLocation( material.shader.program, "u_MatWorld" );
        gl.uniformMatrix4fv( u_MatWorld, false, matWorld.m )

        let u_MatView = gl.getUniformLocation( material.shader.program, "u_MatView" );
        gl.uniformMatrix4fv( u_MatView, false, camera.matView.m )

        let u_MatProj = gl.getUniformLocation( material.shader.program, "u_MatProj" );
        gl.uniformMatrix4fv( u_MatProj, false, camera.matProj.m )

        let u_Color = gl.getUniformLocation( material.shader.program, "u_Color" );
        gl.uniform4f( u_Color, material.color.r, material.color.g, material.color.b, material.color.a );

        let u_TextureAlbedo = gl.getUniformLocation( material.shader.program, "u_TextureAlbedo" );
        if( u_TextureAlbedo != null )
        {
            let textureUnit = 0;
            gl.activeTexture( gl.TEXTURE0 + textureUnit );
            gl.bindTexture( gl.TEXTURE_2D, material.texture.textureID );
            gl.uniform1i( u_TextureAlbedo, textureUnit );
        }

        // Lights.
        if( lights != null && lights.length > 0 )
        {
            let u_LightPos = gl.getUniformLocation( material.shader.program, "u_LightPosition[0]" );
            gl.uniform3f( u_LightPos, lights[0].position.x, lights[0].position.y, lights[0].position.z );

            let u_LightColor = gl.getUniformLocation( material.shader.program, "u_LightColor[0]" );
            gl.uniform3f( u_LightColor, lights[0].color.r, lights[0].color.g, lights[0].color.b );
        }

        let u_CameraPosition = gl.getUniformLocation( material.shader.program, "u_CameraPosition" );
        gl.uniform3f( u_CameraPosition, camera.position.x, camera.position.y, camera.position.z );

        // Draw.
        if( this.numIndices == 0 )
            gl.drawArrays( this.primitiveType, 0, this.numVerts );
        else
            gl.drawElements( this.primitiveType, this.numIndices, gl.UNSIGNED_SHORT, 0 );

        if( a_UV != -1 )
            gl.disableVertexAttribArray( a_UV );
        if( a_Normal != -1 )
            gl.disableVertexAttribArray( a_Normal );
        if( a_Color != -1 )
            gl.disableVertexAttribArray( a_Color );
    }
}
