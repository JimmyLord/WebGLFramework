class MeshDynamic extends Mesh
{
    constructor(gl)
    {
        super( gl );
    }

    startShape(primitiveType, numVerts)
    {
        let gl = this.gl;

        this.clear();

        this.primitiveType = primitiveType;
        this.numVerts = 0;

        let sizeofFloat32 = 4;
        let sizeofUint8 = 1;

        // VertexFormat: XYZ UV XYZ RGBA. (8 floats + 4 uint8s or 9 floats or 36 bytes)
        let sizeofVertex = (8*sizeofFloat32 + 4*sizeofUint8);
        let spaceNeeded = numVerts * sizeofVertex;
        if( this.sizeAllocated < spaceNeeded )
        {
            this.sizeAllocated = spaceNeeded;
            this.vertexAttributes = new ArrayBuffer( spaceNeeded );
            this.vertexAttributesAsFloats = new Float32Array( this.vertexAttributes );
            this.vertexAttributesAsUint8s = new Uint8Array( this.vertexAttributes );
            this.VBO = gl.createBuffer();
            gl.bindBuffer( gl.ARRAY_BUFFER, this.VBO );
            gl.bufferData( gl.ARRAY_BUFFER, this.vertexAttributes, gl.STATIC_DRAW );
        }
    }

    removeAllVerts()
    {
        this.numVerts = 0;
    }

    endShape()
    {
        let gl = this.gl;

        gl.bindBuffer( gl.ARRAY_BUFFER, this.VBO );
        gl.bufferSubData( gl.ARRAY_BUFFER, 0, this.vertexAttributes );
    }
}
