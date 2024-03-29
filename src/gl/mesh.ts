import { Camera } from "../core/camera.js";
import { Light } from "../datatypes/light.js";
import { Material } from "../datatypes/material.js";
import { color } from "../datatypes/color.js";
import { mat4 } from "../datatypes/matrix.js";
import { vec2, vec3 } from "../datatypes/vector.js";

export class Mesh
{
    gl: WebGL2RenderingContext;
    VBO: WebGLBuffer | null = null;
    IBO: WebGLBuffer | null = null;
    numVerts: number;
    numIndices: number;
    primitiveType: number;

    sizeAllocated: number;
    vertexAttributes: ArrayBuffer | null = null;
    vertexAttributesAsFloats: Float32Array | null = null;
    vertexAttributesAsUint8s: Uint8Array | null = null;
    indices16: ArrayBuffer | null = null;
    indicesAsUint16s: Uint16Array | null = null;

    edgeList: Array<Array<number>> | null = null;

    constructor(gl: WebGL2RenderingContext)
    {
        this.gl = gl;
        this.VBO = null;
        this.IBO = null;
        this.numVerts = 0;
        this.numIndices = 0;
        this.primitiveType = gl.POINTS;

        // Only stored if using startShape/addVertex/endShape until endShape is called.
        // Also stored if requested when calling "create" method.
        this.sizeAllocated = 0;
        this.vertexAttributes = null;
        this.vertexAttributesAsFloats = null;
        this.vertexAttributesAsUint8s = null;
        this.indices16 = null;
        this.indicesAsUint16s = null;
        
        // Edges, only stored for CreateBox for now, can be used for collision checks.
        // Can easily be expanded to other convex shapes.
        // TODO: Move colliders into their own class.
        this.edgeList = null;
    }

    free()
    {
        this.clear();
    }

    clear()
    {
        if( this.VBO == null )
            return;

        let gl = this.gl;

        // Manually resize buffer to 1 byte to reduce memory usage on shutdown.
        gl.bindBuffer( gl.ARRAY_BUFFER, this.VBO );
        gl.bufferData( gl.ARRAY_BUFFER, 1, gl.STATIC_DRAW );
        gl.bindBuffer( gl.ARRAY_BUFFER, null );
        gl.deleteBuffer( this.VBO )

        // Manually resize buffer to 1 byte to reduce memory usage on shutdown.
        if( this.IBO !== null )
        {
            gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.IBO );
            gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, 1, gl.STATIC_DRAW );
            gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, null );
            gl.deleteBuffer( this.IBO )
        }

        this.VBO = null;
        this.IBO = null;
        this.numVerts = 0;
        this.numIndices = 0;
        this.primitiveType = gl.POINTS;
    }

    getVertexPosition(vertexIndex: number)
    {
        if( this.vertexAttributesAsFloats == null )
            return null;

        let x = this.vertexAttributesAsFloats[vertexIndex*9 + 0];
        let y = this.vertexAttributesAsFloats[vertexIndex*9 + 1];
        let z = this.vertexAttributesAsFloats[vertexIndex*9 + 2];
        return vec3.getTemp( x, y, z );
    }

    getVertexPositionsAtEdge(edgeIndex: number, outVert1: vec3, outVert2: vec3)
    {
        if( this.vertexAttributesAsFloats == null )
            return null;
        console.assert( outVert1 !== null, "getVertexPositionAtEdge: no valid vec3 reference in outVert1." );
        console.assert( outVert2 !== null, "getVertexPositionAtEdge: no valid vec3 reference in outVert2." );

        if( this.edgeList == null )
        {
            console.assert( false, "getVertexPositionAtEdge: Mesh doesn't have an edge list." );
        }
        else
        {
            console.assert( edgeIndex < this.edgeList.length )
            
            outVert1.x = this.vertexAttributesAsFloats[this.edgeList[edgeIndex][0]*9 + 0];
            outVert1.y = this.vertexAttributesAsFloats[this.edgeList[edgeIndex][0]*9 + 1];
            outVert1.z = this.vertexAttributesAsFloats[this.edgeList[edgeIndex][0]*9 + 2];

            outVert2.x = this.vertexAttributesAsFloats[this.edgeList[edgeIndex][1]*9 + 0];
            outVert2.y = this.vertexAttributesAsFloats[this.edgeList[edgeIndex][1]*9 + 1];
            outVert2.z = this.vertexAttributesAsFloats[this.edgeList[edgeIndex][1]*9 + 2];
        }
    }

    createTriangle(width: number, height: number)
    {
        let gl = this.gl;

        let numVerts = 3;
        let sizeofFloat32 = 4;
        let sizeofUint8 = 1;
        let vertexPositions = [ -width/2,-height/2,0,   0,height/2,0,   width/2,-height/2,0, ];
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

    createBox(width: number, height: number, storeVerticesLocally: boolean = false)
    {
        let gl = this.gl;

        let numVerts = 4;
        let numIndices = 6;
        let sizeofFloat32 = 4;
        let sizeofUint8 = 1;
        let sizeofUnsignedShort = 2;
        let vertexPosUVColor = [
                -width/2, -height/2, 0,    0, 0,   0, 0, 128, 255, // BL
                -width/2,  height/2, 0,    0, 1,   0, 0, 128, 255, // TL
                width/2,  height/2, 0,    1, 1,   0, 0, 128, 255, // TR
                width/2, -height/2, 0,    1, 0,   0, 0, 128, 255, // BR
            ];

        let indices = [
                0, 1, 2,  0, 2, 3,
            ];

        this.edgeList = [ [0,1], [1,2], [2,3], [3,0] ];

        // VertexFormat: XYZ UV XYZ RGBA. (8 floats + 4 uint8s or 9 floats or 36 bytes)
        let sizeofVertex = (8*sizeofFloat32 + 4*sizeofUint8);
        this.sizeAllocated = numVerts * sizeofVertex;
        this.vertexAttributes = new ArrayBuffer( this.sizeAllocated );
        this.vertexAttributesAsFloats = new Float32Array( this.vertexAttributes );
        for( let i=0; i<numVerts; i++ )
        {
            this.vertexAttributesAsFloats[i*9 + 0] = vertexPosUVColor[i*9 + 0];
            this.vertexAttributesAsFloats[i*9 + 1] = vertexPosUVColor[i*9 + 1];
            this.vertexAttributesAsFloats[i*9 + 2] = vertexPosUVColor[i*9 + 2];
            this.vertexAttributesAsFloats[i*9 + 3] = vertexPosUVColor[i*9 + 3];
            this.vertexAttributesAsFloats[i*9 + 4] = vertexPosUVColor[i*9 + 4];
            this.vertexAttributesAsFloats[i*9 + 5] = 0;
            this.vertexAttributesAsFloats[i*9 + 6] = 0;
            this.vertexAttributesAsFloats[i*9 + 7] = -1;
        }

        this.vertexAttributesAsUint8s = new Uint8Array( this.vertexAttributes );
        for( let i=0; i<numVerts; i++ )
        {
            this.vertexAttributesAsUint8s[i*sizeofVertex + 8*4 + 0] = vertexPosUVColor[i*9 + 5];
            this.vertexAttributesAsUint8s[i*sizeofVertex + 8*4 + 1] = vertexPosUVColor[i*9 + 6];
            this.vertexAttributesAsUint8s[i*sizeofVertex + 8*4 + 2] = vertexPosUVColor[i*9 + 7];
            this.vertexAttributesAsUint8s[i*sizeofVertex + 8*4 + 3] = vertexPosUVColor[i*9 + 8];
        }

        // Indices: Uint16.
        this.indices16 = new ArrayBuffer( numIndices * sizeofUnsignedShort );
        this.indicesAsUint16s = new Uint16Array( this.indices16 );
        for( let i=0; i<numIndices; i++ )
        {
            this.indicesAsUint16s[i] = indices[i];
        }

        this.VBO = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, this.VBO );
        gl.bufferData( gl.ARRAY_BUFFER, this.vertexAttributes, gl.STATIC_DRAW );

        this.IBO = gl.createBuffer();
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.IBO );
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, this.indices16, gl.STATIC_DRAW );

        this.numVerts = numVerts;
        this.numIndices = numIndices;
        this.primitiveType = gl.TRIANGLES;

        if( storeVerticesLocally === false )
        {
            this.sizeAllocated = 0;
            this.vertexAttributes = null;
            this.vertexAttributesAsFloats = null;
            this.vertexAttributesAsUint8s = null;
            this.indices16 = null;
            this.indicesAsUint16s = null;
        }
    }

    createCube(width: number, height: number, depth: number)
    {
        let gl = this.gl;

        let numVerts = 24;
        let numIndices = 36;
        let sizeofFloat32 = 4;
        let sizeofUint8 = 1;
        let sizeofUnsignedShort = 2;
        let vertexPosUVNormalColor = [
                // Front
                -width/2, -height/2, -depth/2,   0,0,   0,0,-1,   0,0,128,255,
                -width/2,  height/2, -depth/2,   0,1,   0,0,-1,   0,0,128,255,
                width/2,  height/2, -depth/2,   1,1,   0,0,-1,   0,0,128,255,
                width/2, -height/2, -depth/2,   1,0,   0,0,-1,   0,0,128,255,
                // Back
                -width/2, -height/2,  depth/2,   0,0,   0,0,1,    0,0,255,255,
                -width/2,  height/2,  depth/2,   0,1,   0,0,1,    0,0,255,255,
                width/2,  height/2,  depth/2,   1,1,   0,0,1,    0,0,255,255,
                width/2, -height/2,  depth/2,   1,0,   0,0,1,    0,0,255,255,
                // Left
                -width/2, -height/2, -depth/2,   0,0,   -1,0,0,   128,0,0,255,
                -width/2,  height/2, -depth/2,   0,1,   -1,0,0,   128,0,0,255,
                -width/2,  height/2,  depth/2,   1,1,   -1,0,0,   128,0,0,255,
                -width/2, -height/2,  depth/2,   1,0,   -1,0,0,   128,0,0,255,
                // Right
                width/2, -height/2, -depth/2,   0,0,   1,0,0,    255,0,0,255,
                width/2,  height/2, -depth/2,   0,1,   1,0,0,    255,0,0,255,
                width/2,  height/2,  depth/2,   1,1,   1,0,0,    255,0,0,255,
                width/2, -height/2,  depth/2,   1,0,   1,0,0,    255,0,0,255,
                // Top
                -width/2,  height/2, -depth/2,   0,0,   0,1,0,    0,255,0,255,
                -width/2,  height/2,  depth/2,   0,1,   0,1,0,    0,255,0,255,
                width/2,  height/2,  depth/2,   1,1,   0,1,0,    0,255,0,255,
                width/2,  height/2, -depth/2,   1,0,   0,1,0,    0,255,0,255,
                // Bottom
                -width/2, -height/2, -depth/2,   0,0,   0,-1,0,   0,128,0,255,
                -width/2, -height/2,  depth/2,   0,1,   0,-1,0,   0,128,0,255,
                width/2, -height/2,  depth/2,   1,1,   0,-1,0,   0,128,0,255,
                width/2, -height/2, -depth/2,   1,0,   0,-1,0,   0,128,0,255,
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

    createCircle(numSides: number, radius: number, outline: boolean = false)
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
        if( outline === true )
            this.primitiveType = gl.LINE_LOOP;
        else
            this.primitiveType = gl.TRIANGLE_FAN;
    }

    startShape(primitiveType: number, numVerts: number, numIndices: number = 0)
    {
        this.clear();

        this.primitiveType = primitiveType;
        this.numVerts = 0;

        let sizeofFloat32 = 4;
        let sizeofUint8 = 1;
        let sizeofUnsignedShort = 2;

        // VertexFormat: XYZ UV XYZ RGBA. (8 floats + 4 uint8s or 9 floats or 36 bytes)
        let sizeofVertex = (8*sizeofFloat32 + 4*sizeofUint8);
        this.vertexAttributes = new ArrayBuffer( numVerts * sizeofVertex );
        this.vertexAttributesAsFloats = new Float32Array( this.vertexAttributes );
        this.vertexAttributesAsUint8s = new Uint8Array( this.vertexAttributes );

        if( numIndices > 0 )
        {
            this.indices16 = new ArrayBuffer( numIndices * sizeofUnsignedShort );
            this.indicesAsUint16s = new Uint16Array( this.indices16 );
        }
    }

    addVertex(pos: vec3, uv: vec2, normal: vec3, color: color)
    {
        if( this.vertexAttributesAsFloats == null ) return;
        if( this.vertexAttributesAsUint8s == null ) return;
        
        let vertexFloatIndex = this.numVerts*9;

        this.vertexAttributesAsFloats[vertexFloatIndex + 0] = pos.x;
        this.vertexAttributesAsFloats[vertexFloatIndex + 1] = pos.y;
        this.vertexAttributesAsFloats[vertexFloatIndex + 2] = pos.z;
        this.vertexAttributesAsFloats[vertexFloatIndex + 3] = uv.x;
        this.vertexAttributesAsFloats[vertexFloatIndex + 4] = uv.y;
        this.vertexAttributesAsFloats[vertexFloatIndex + 5] = normal.x;
        this.vertexAttributesAsFloats[vertexFloatIndex + 6] = normal.y;
        this.vertexAttributesAsFloats[vertexFloatIndex + 7] = normal.z;

        this.vertexAttributesAsUint8s[vertexFloatIndex*4 + 8*4 + 0] = color.r;
        this.vertexAttributesAsUint8s[vertexFloatIndex*4 + 8*4 + 1] = color.g;
        this.vertexAttributesAsUint8s[vertexFloatIndex*4 + 8*4 + 2] = color.b;
        this.vertexAttributesAsUint8s[vertexFloatIndex*4 + 8*4 + 3] = color.a;

        this.numVerts++;
    }

    addVertexF(x: number, y: number, z: number,
            u: number, v: number,
            nx: number, ny: number, nz: number,
            r: number, g: number, b: number, a: number)
    {
        if( this.vertexAttributesAsFloats == null ) return;
        if( this.vertexAttributesAsUint8s == null ) return;

        let vertexFloatIndex = this.numVerts*9;

        this.vertexAttributesAsFloats[vertexFloatIndex + 0] = x;
        this.vertexAttributesAsFloats[vertexFloatIndex + 1] = y;
        this.vertexAttributesAsFloats[vertexFloatIndex + 2] = z;
        this.vertexAttributesAsFloats[vertexFloatIndex + 3] = u;
        this.vertexAttributesAsFloats[vertexFloatIndex + 4] = v;
        this.vertexAttributesAsFloats[vertexFloatIndex + 5] = nx;
        this.vertexAttributesAsFloats[vertexFloatIndex + 6] = ny;
        this.vertexAttributesAsFloats[vertexFloatIndex + 7] = nz;

        this.vertexAttributesAsUint8s[vertexFloatIndex*4 + 8*4 + 0] = r;
        this.vertexAttributesAsUint8s[vertexFloatIndex*4 + 8*4 + 1] = g;
        this.vertexAttributesAsUint8s[vertexFloatIndex*4 + 8*4 + 2] = b;
        this.vertexAttributesAsUint8s[vertexFloatIndex*4 + 8*4 + 3] = a;

        this.numVerts++;
    }

    addIndex(i: number)
    {
        if( this.indicesAsUint16s == null ) return;

        this.indicesAsUint16s[this.numIndices] = i;
        this.numIndices++;
    }

    addEdge(index0: number, index1: number)
    {
        if( this.edgeList == null )
            this.edgeList = [];

        this.edgeList.push( [index0, index1] );
    }

    addSprite(bottomLeftPos: vec2, size: vec2, bottomLeftUV: vec2, uvSize: vec2)
    {
        this.addSpriteF( bottomLeftPos.x, bottomLeftPos.y, size.x, size.y, bottomLeftUV.x, bottomLeftUV.y, uvSize.x, uvSize.y );
    }

    addSpriteF(blX: number, blY: number, sizeX: number, sizeY: number,
            blUVx: number, blUVy: number, uvSizeX: number, uvSizeY: number)
    {
        this.addVertexF( blX,       blY,       0, blUVx,         blUVy,          0,0,0,  255,255,255,255 );
        this.addVertexF( blX,       blY+sizeY, 0, blUVx,         blUVy+uvSizeY,  0,0,0,  255,255,255,255 );
        this.addVertexF( blX+sizeX, blY+sizeY, 0, blUVx+uvSizeX, blUVy+uvSizeY,  0,0,0,  255,255,255,255 );

        this.addVertexF( blX,       blY,       0, blUVx,         blUVy,          0,0,0,  255,255,255,255 );
        this.addVertexF( blX+sizeX, blY+sizeY, 0, blUVx+uvSizeX, blUVy+uvSizeY,  0,0,0,  255,255,255,255 );
        this.addVertexF( blX+sizeX, blY,       0, blUVx+uvSizeX, blUVy,          0,0,0,  255,255,255,255 );
    }

    endShape()
    {
        let gl = this.gl;

        this.VBO = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, this.VBO );
        gl.bufferData( gl.ARRAY_BUFFER, this.vertexAttributes, gl.STATIC_DRAW );

        if( this.numIndices > 0 )
        {
            this.IBO = gl.createBuffer();
            gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.IBO );
            gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, this.indices16, gl.STATIC_DRAW );
        }

        // Free our copy of the vertices.
        //this.vertexAttributes = null;
        //this.vertexAttributesAsFloats = null;
        //this.indices16 = null;
        //this.indicesAsUint16s = null;
    }

    draw(camera: Camera, matWorld: mat4, material: Material, lights: Light[] | null = null)
    {
        if( material.shader == null ) return;
        
        let shader = material.shader;        
        if( shader.a_Position == null ) return;

        let gl = this.gl;

        if( this.VBO == null )
            return;

        if( material == null )
            return;

        // Set up VBO and attributes.
        gl.bindBuffer( gl.ARRAY_BUFFER, this.VBO );
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.IBO );

        let vertexSize = (3+2+3)*4 + 4*1; // (Pos, UV, Normal) + Color

        gl.enableVertexAttribArray( shader.a_Position );
        gl.vertexAttribPointer( shader.a_Position, 3, gl.FLOAT, false, vertexSize, 0 )

        if( shader.a_UV !== -1 )
        {
            gl.enableVertexAttribArray( shader.a_UV );
            gl.vertexAttribPointer( shader.a_UV, 2, gl.FLOAT, false, vertexSize, 12 )
        }

        if( shader.a_Normal !== -1 )
        {
            gl.enableVertexAttribArray( shader.a_Normal );
            gl.vertexAttribPointer( shader.a_Normal, 3, gl.FLOAT, false, vertexSize, 20 )
        }

        if( shader.a_Color !== -1 )
        {
            gl.enableVertexAttribArray( shader.a_Color );
            gl.vertexAttribPointer( shader.a_Color, 4, gl.UNSIGNED_BYTE, true, vertexSize, 32 )
        }

        // Set up shader and uniforms.
        gl.useProgram( shader.program );

        gl.uniformMatrix4fv( shader.u_MatWorld, false, matWorld.m )
        gl.uniformMatrix4fv( shader.u_MatView, false, camera.matView.m )
        gl.uniformMatrix4fv( shader.u_MatProj, false, camera.matProj.m )
        gl.uniform4f( shader.u_UVTransform, material.uvTransform.x, material.uvTransform.y, material.uvTransform.z, material.uvTransform.w );
        gl.uniform4f( shader.u_Color, material.color.r, material.color.g, material.color.b, material.color.a );

        if( shader.u_TextureAlbedo !== null && material.texture !== null )
        {
            let textureUnit = 0;
            gl.activeTexture( gl.TEXTURE0 + textureUnit );
            gl.bindTexture( gl.TEXTURE_2D, material.texture.textureID );
            gl.uniform1i( shader.u_TextureAlbedo, textureUnit );
        }

        // Lights.
        if( lights !== null && lights.length > 0 )
        {
            if( shader.u_LightPos && shader.u_LightColor && shader.u_LightRadius )
            {
                let i=0;
                for( ; i<lights.length; i++ )
                {
                    gl.uniform3f( shader.u_LightPos[i], lights[i].position.x, lights[i].position.y, lights[i].position.z );
                    gl.uniform3f( shader.u_LightColor[i], lights[i].color.r, lights[i].color.g, lights[i].color.b );
                    gl.uniform1f( shader.u_LightRadius[i], lights[i].radius );
                }
                
                for( ; i<4; i++ )
                {
                    gl.uniform3f( shader.u_LightPos[i], 0, 0, 0 );
                    gl.uniform3f( shader.u_LightColor[i], 0, 0, 0 );
                    gl.uniform1f( shader.u_LightRadius[i], 1 );
                }
            }
        }

        gl.uniform3f( shader.u_CameraPosition, camera.position.x, camera.position.y, camera.position.z );

        // Draw.
        if( this.numIndices === 0 )
            gl.drawArrays( this.primitiveType, 0, this.numVerts );
        else
            gl.drawElements( this.primitiveType, this.numIndices, gl.UNSIGNED_SHORT, 0 );

        if( shader.a_UV !== -1 )
            gl.disableVertexAttribArray( shader.a_UV );
        if( shader.a_Normal !== -1 )
            gl.disableVertexAttribArray( shader.a_Normal );
        if( shader.a_Color !== -1 )
            gl.disableVertexAttribArray( shader.a_Color );
    }
}
