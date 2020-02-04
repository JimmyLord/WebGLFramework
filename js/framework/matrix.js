class mat4
{
    constructor()
    {
        this.values = new Float32Array(16);
    }

    free()
    {
        this.value = null;
    }

    setIdentity()
    {
        this.values[ 0] = 1; this.values[ 1] = 0; this.values[ 2] = 0; this.values[ 3] = 0;
        this.values[ 4] = 0; this.values[ 5] = 1; this.values[ 6] = 0; this.values[ 7] = 0;
        this.values[ 8] = 0; this.values[ 9] = 0; this.values[10] = 1; this.values[11] = 0;
        this.values[12] = 0; this.values[13] = 0; this.values[14] = 0; this.values[15] = 1;
    }

    translate(xOrVec3, y, z)
    {
        if( xOrVec3 instanceof vec3 )
        {
            this.values[12] += xOrVec3.x;
            this.values[13] += xOrVec3.y;
            this.values[14] += xOrVec3.z;
        }
        else
        {
            this.values[12] += xOrVec3;
            this.values[13] += y;
            this.values[14] += z;
        }
    }
}
