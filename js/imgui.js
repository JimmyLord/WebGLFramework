class ImGui
{
    constructor(gl, canvas)
    {
        this.gl = gl;
        this.canvas = canvas;

        this.drawList = [];

        this.VBO = gl.createBuffer();
        this.IBO = gl.createBuffer();

        this.position = new vec3(0);
        this.padding = new vec3(2);

        let imguiVertShaderSource = `
            attribute vec4 a_Position;
            attribute vec2 a_UV;
            attribute vec4 a_Color;

            uniform mat4 u_MatProj;

            varying vec2 v_UV;
            varying vec4 v_Color;

            void main()
            {
                gl_Position = u_MatProj * a_Position;
                v_UV = a_UV;
                v_Color = a_Color;
            }
        `;

        let imguiFragShaderSource = `
            precision mediump float;

            uniform sampler2D u_TextureAlbedo;

            varying vec2 v_UV;
            varying vec4 v_Color;
            
            void main()
            {
                gl_FragColor = texture2D( u_TextureAlbedo, v_UV ).rrrr * 255.0 * v_Color;
            }
        `;

        this.shader = new Shader( gl, imguiVertShaderSource, imguiFragShaderSource );
        this.generateFontTexture();
    }

    generateFontTexture()
    {
        let pixels = new Uint8Array( [
            // TODO 33-47: !"#$%&'()*+,-./
            // TODO 48-64: 0123456789:;<=>?@
            // 65-77: Upper case A-M
            0,0,0,1,1,0,0,0, 0,1,1,1,1,1,0,0, 0,1,1,1,1,1,0,0, 0,1,1,1,1,1,0,0, 0,1,1,1,1,1,1,0, 0,1,1,1,1,1,0,0, 0,1,1,1,1,1,1,0, 0,1,0,0,0,0,1,0, 0,0,1,1,1,1,1,0, 0,0,0,1,1,1,1,0, 0,1,0,0,0,1,0,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,1,0,
            0,0,1,0,0,1,0,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,1,0, 0,0,0,0,1,0,0,0, 0,0,0,0,0,1,0,0, 0,1,0,0,0,1,0,0, 0,1,0,0,0,0,0,0, 0,1,1,0,0,1,1,0,
            0,0,1,0,0,1,0,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,1,0, 0,0,0,0,1,0,0,0, 0,0,0,0,0,1,0,0, 0,1,0,0,1,0,0,0, 0,1,0,0,0,0,0,0, 0,1,0,1,1,0,1,0,
            0,1,0,0,0,0,1,0, 0,1,1,1,1,1,0,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,1,0, 0,0,0,0,1,0,0,0, 0,0,0,0,0,1,0,0, 0,1,0,1,0,0,0,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,1,0,
            0,1,1,1,1,1,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,1,0, 0,1,1,1,1,1,1,0, 0,1,1,1,1,0,0,0, 0,1,0,0,1,1,1,0, 0,1,1,1,1,1,1,0, 0,0,0,0,1,0,0,0, 0,0,0,0,0,1,0,0, 0,1,1,0,0,0,0,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,1,0,
            0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,0,0,0,1,0,0,0, 0,0,0,0,0,1,0,0, 0,1,0,1,0,0,0,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,1,0,
            0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,0,0,0,1,0,0,0, 0,0,1,0,0,1,0,0, 0,1,0,0,1,0,0,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,1,0,
            0,1,0,0,0,0,1,0, 0,1,1,1,1,1,0,0, 0,1,1,1,1,1,0,0, 0,1,1,1,1,1,0,0, 0,1,1,1,1,1,1,0, 0,1,0,0,0,0,0,0, 0,1,1,1,1,1,1,0, 0,1,0,0,0,0,1,0, 0,0,1,1,1,1,1,0, 0,0,0,1,1,0,0,0, 0,1,0,0,0,1,0,0, 0,1,1,1,1,1,0,0, 0,1,0,0,0,0,1,0,
            // 78-90: Upper case N-Z
            0,1,0,0,0,0,1,0, 0,0,1,1,1,1,0,0, 0,1,1,1,1,1,0,0, 0,0,1,1,1,1,0,0, 0,1,1,1,1,1,0,0, 0,0,1,1,1,1,1,0, 0,0,1,1,1,1,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,0,1,0,0,0,1,0, 0,1,1,1,1,1,1,0,
            0,1,1,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,0,0, 0,0,0,0,1,0,0,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,0,1,0,0,1,0,0, 0,0,1,0,0,0,1,0, 0,0,0,0,0,0,1,0,
            0,1,0,1,0,0,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,0,0, 0,0,0,0,1,0,0,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,0,1,0,0,1,0,0, 0,0,0,1,0,1,0,0, 0,0,0,0,0,1,0,0,
            0,1,0,0,1,0,1,0, 0,1,0,0,0,0,1,0, 0,1,1,1,1,1,0,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,0,0, 0,0,0,0,1,0,0,0, 0,1,0,0,0,0,1,0, 0,1,1,0,0,1,1,0, 0,1,0,0,0,0,1,0, 0,0,0,1,1,0,0,0, 0,0,0,1,0,1,0,0, 0,0,0,0,1,0,0,0,
            0,1,0,0,0,1,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,1,0, 0,1,1,1,1,1,0,0, 0,0,1,1,1,1,0,0, 0,0,0,0,1,0,0,0, 0,1,0,0,0,0,1,0, 0,0,1,0,0,1,0,0, 0,1,0,0,0,0,1,0, 0,0,0,1,1,0,0,0, 0,0,0,0,1,0,0,0, 0,0,0,1,0,0,0,0,
            0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,0,0, 0,1,0,0,1,0,1,0, 0,1,0,0,1,0,0,0, 0,0,0,0,0,0,1,0, 0,0,0,0,1,0,0,0, 0,1,0,0,0,0,1,0, 0,0,1,0,0,1,0,0, 0,1,0,0,0,0,1,0, 0,0,1,0,0,1,0,0, 0,0,0,0,1,0,0,0, 0,0,1,0,0,0,0,0,
            0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,1,1,0, 0,1,0,0,0,1,0,0, 0,0,0,0,0,0,1,0, 0,0,0,0,1,0,0,0, 0,1,0,0,0,0,1,0, 0,0,1,1,1,1,0,0, 0,1,0,1,1,0,1,0, 0,0,1,0,0,1,0,0, 0,0,0,0,1,0,0,0, 0,1,0,0,0,0,0,0,
            0,1,0,0,0,0,1,0, 0,0,1,1,1,1,0,0, 0,1,0,0,0,0,0,0, 0,0,1,1,1,1,1,0, 0,1,0,0,0,0,1,0, 0,1,1,1,1,1,0,0, 0,0,0,0,1,0,0,0, 0,0,1,1,1,1,0,0, 0,0,0,1,1,0,0,0, 0,1,1,0,0,1,1,0, 0,1,0,0,0,0,1,0, 0,0,0,0,1,0,0,0, 0,1,1,1,1,1,1,0,
            // TODO 91-96: [\]^_`
            // TODO 97-109: Lower case a-m
            // TODO 110-122: Lower case n-z
            // TODO 123-126: {|}~
        ] );

        this.texture = new Texture( this.gl );
        this.firstChar = 65;
        this.numCols = 13;
        this.numRows = 2;
        this.texture.createFromUInt8Array( pixels, this.numCols*8, this.numRows*8 );
    }

    newFrame()
    {
        this.drawList.length = 0;
        this.position.setF32( 0, 0, 0 );
    }

    draw()
    {
        let gl = this.gl;

        gl.disable( gl.DEPTH_TEST );
        gl.enable( gl.BLEND );
        gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
        for( let i=0; i<this.drawList.length; i++ )
        {
            let item = this.drawList[i];

            this.drawItem( item );
        }
        gl.enable( gl.DEPTH_TEST );
    }
    
    drawItem(item)
    {
        let gl = this.gl;

        let sizeofFloat32 = 4;
        let sizeofUint8 = 1;
        let sizeofUint16 = 2;
        
        // VertexFormat: XY UV RGBA. (4 floats + 4 uint8s or 5 floats or 20 bytes)
        let sizeofVertex = (4*sizeofFloat32 + 4*sizeofUint8);
        let vertexAttributes = new ArrayBuffer( item.vertexCount * sizeofVertex );
        let vertexAttributesAsFloats = new Float32Array( vertexAttributes );
        for( let i=0; i<item.vertexCount; i++ )
        {
            vertexAttributesAsFloats[i*5 + 0] = item.verts[i*8 + 0];
            vertexAttributesAsFloats[i*5 + 1] = item.verts[i*8 + 1];
            vertexAttributesAsFloats[i*5 + 2] = item.verts[i*8 + 2];
            vertexAttributesAsFloats[i*5 + 3] = item.verts[i*8 + 3];
        }

        let vertexAttributesAsUint8s = new Uint8Array( vertexAttributes );
        for( let i=0; i<item.vertexCount; i++ )
        {
            vertexAttributesAsUint8s[i*sizeofVertex + 4*sizeofFloat32 + 0] = item.verts[i*8 + 4];
            vertexAttributesAsUint8s[i*sizeofVertex + 4*sizeofFloat32 + 1] = item.verts[i*8 + 5];
            vertexAttributesAsUint8s[i*sizeofVertex + 4*sizeofFloat32 + 2] = item.verts[i*8 + 6];
            vertexAttributesAsUint8s[i*sizeofVertex + 4*sizeofFloat32 + 3] = item.verts[i*8 + 7];
        }

        // Indices: Uint16.
        let indices16 = new ArrayBuffer( item.indexCount * sizeofUint16 );
        let indicesAsUint16s = new Uint16Array( indices16 );
        for( let i=0; i<item.indexCount; i++ )
        {
            indicesAsUint16s[i] = item.indices[i];
        }

        gl.bindBuffer( gl.ARRAY_BUFFER, this.VBO );
        gl.bufferData( gl.ARRAY_BUFFER, vertexAttributes, gl.STREAM_DRAW );

        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.IBO );
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, indices16, gl.STREAM_DRAW );

        // Set up VBO and attributes.
        gl.bindBuffer( gl.ARRAY_BUFFER, this.VBO );
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.IBO );

        let a_Position = gl.getAttribLocation( this.shader.program, "a_Position" );
        gl.enableVertexAttribArray( a_Position );
        gl.vertexAttribPointer( a_Position, 2, gl.FLOAT, false, sizeofVertex, 0 )

        let a_UV = gl.getAttribLocation( this.shader.program, "a_UV" );
        if( a_UV != -1 )
        {
            gl.enableVertexAttribArray( a_UV );
            gl.vertexAttribPointer( a_UV, 2, gl.FLOAT, false, sizeofVertex, 8 )
        }

        let a_Color = gl.getAttribLocation( this.shader.program, "a_Color" );
        if( a_Color != -1 )
        {
            gl.enableVertexAttribArray( a_Color );
            gl.vertexAttribPointer( a_Color, 4, gl.UNSIGNED_BYTE, true, sizeofVertex, 16 )
        }

        // Set up shader and uniforms.
        gl.useProgram( this.shader.program );

        this.matProj = new mat4();
        this.matProj.createOrthoInfiniteZ( 0, this.canvas.width, 0, this.canvas.height );

        let u_MatProj = gl.getUniformLocation( this.shader.program, "u_MatProj" );
        gl.uniformMatrix4fv( u_MatProj, false, this.matProj.m )

        let u_TextureAlbedo = gl.getUniformLocation( this.shader.program, "u_TextureAlbedo" );
        if( u_TextureAlbedo != null )
        {
            let textureUnit = 0;
            gl.activeTexture( gl.TEXTURE0 + textureUnit );
            gl.bindTexture( gl.TEXTURE_2D, this.texture.textureID );
            gl.uniform1i( u_TextureAlbedo, textureUnit );
        }

        // Draw.
        gl.drawElements( item.primitiveType, item.indexCount, gl.UNSIGNED_SHORT, 0 );

        if( a_UV != -1 )
            gl.disableVertexAttribArray( a_UV );
        if( a_Color != -1 )
            gl.disableVertexAttribArray( a_Color );
    }

    text(str)
    {
        let gl = this.gl;

        let w = 8;
        let h = 8;

        let numVerts = 0;
        let numIndices = 0;
        let verts = [];
        let indices = [];

        let x = this.position.x + this.padding.x;
        let y = this.canvas.height - (h + this.padding.y) - this.position.y;

        let stepU = 1.0 / this.numCols;
        let stepV = 1.0 / this.numRows;

        let count = 0;
        for( let i=0; i<str.length; i++ )
        {
            let c = str.charCodeAt(i);
            if( c == 32 )
            {
                x += w;
                continue;
            }
            c -= this.firstChar;
            let cx = Math.trunc( c % this.numCols );
            let cy = Math.trunc( c / this.numCols );

            verts.push( x+0,y+0,   stepU*(cx+0),stepV*(cy+1),   255,255,255,255 );
            verts.push( x+0,y+h,   stepU*(cx+0),stepV*(cy+0),   255,255,255,255 );
            verts.push( x+w,y+h,   stepU*(cx+1),stepV*(cy+0),   255,255,255,255 );
            verts.push( x+w,y+0,   stepU*(cx+1),stepV*(cy+1),   255,255,255,255 );
            indices.push( count*4+0,count*4+1,count*4+2, count*4+0,count*4+2,count*4+3 );

            numVerts += 4;
            numIndices += 6;

            x += w;
            count++;
        }

        this.drawList.push( new DrawListItem( gl.TRIANGLES, numVerts, verts, numIndices, indices ) );

        this.position.y += h + this.padding.y;
    }
}

class DrawListItem
{
    constructor(primitiveType, vertCount, verts, indexCount, indices)
    {
        this.primitiveType = primitiveType;
        this.vertexCount = vertCount;
        this.indexCount = indexCount;
        this.verts = verts;
        this.indices = indices;
    }
}
