// Values are stored column major.
// m[ 0] m[ 4] m[ 8] m[12]       Sx  0  0 Tx
// m[ 1] m[ 5] m[ 9] m[13]  --\   0 Sy  0 Ty
// m[ 2] m[ 6] m[10] m[14]  --/   0  0 Sz Tz
// m[ 3] m[ 7] m[11] m[15]        0  0  0  1
class mat4
{
    constructor()
    {
        this.m = new Float32Array(16);
    }

    // Temp vars to avoid GC.
    // Warning: This will cause issue if operations are chained since new values will overwrite old ones.
    static rotMat = new mat4;
    static adjugateMatrix = new mat4;
    static tempVec3 = new vec3;
    static tempVec4 = new vec4;
    static tempMat4 = new mat4;

    free()
    {
        this.m = null;
    }

    set(o)
    {
        this.m[ 0] = o.m[ 0]; this.m[ 4] = o.m[ 4]; this.m[ 8] = o.m[ 8]; this.m[12] = o.m[12];
        this.m[ 1] = o.m[ 1]; this.m[ 5] = o.m[ 5]; this.m[ 9] = o.m[ 9]; this.m[13] = o.m[13];
        this.m[ 2] = o.m[ 2]; this.m[ 6] = o.m[ 6]; this.m[10] = o.m[10]; this.m[14] = o.m[14];
        this.m[ 3] = o.m[ 3]; this.m[ 7] = o.m[ 7]; this.m[11] = o.m[11]; this.m[15] = o.m[15];
    }

    setIdentity()
    {
        this.m[ 0] = 1; this.m[ 4] = 0; this.m[ 8] = 0; this.m[12] = 0;
        this.m[ 1] = 0; this.m[ 5] = 1; this.m[ 9] = 0; this.m[13] = 0;
        this.m[ 2] = 0; this.m[ 6] = 0; this.m[10] = 1; this.m[14] = 0;
        this.m[ 3] = 0; this.m[ 7] = 0; this.m[11] = 0; this.m[15] = 1;
    }

    translate(pos)
    {
        this.m[12] += pos.x;
        this.m[13] += pos.y;
        this.m[14] += pos.z;
    }

    translateF32(x, y, z)
    {
        this.m[12] += x;
        this.m[13] += y;
        this.m[14] += z;
    }

    rotate(angleDegrees, x, y, z)
    {
        let sinAngle = Math.sin( angleDegrees * Math.PI / 180 )
        let cosAngle = Math.cos( angleDegrees * Math.PI / 180 )

        let mag = Math.sqrt( x*x + y*y + z*z );
        if( mag > 0 )
        {
            let xx, yy, zz, xy, yz, zx, xs, ys, zs;
            let oneMinusCos;
       
            x /= mag;
            y /= mag;
            z /= mag;
    
            xx = x * x;
            yy = y * y;
            zz = z * z;
            xy = x * y;
            yz = y * z;
            zx = z * x;
            xs = x * sinAngle;
            ys = y * sinAngle;
            zs = z * sinAngle;
            oneMinusCos = 1 - cosAngle;
    
            mat4.rotMat.m[ 0] = (oneMinusCos * xx) + cosAngle;
            mat4.rotMat.m[ 1] = (oneMinusCos * xy) - zs;
            mat4.rotMat.m[ 2] = (oneMinusCos * zx) + ys;
            mat4.rotMat.m[ 3] = 0; 
    
            mat4.rotMat.m[ 4] = (oneMinusCos * xy) + zs;
            mat4.rotMat.m[ 5] = (oneMinusCos * yy) + cosAngle;
            mat4.rotMat.m[ 6] = (oneMinusCos * yz) - xs;
            mat4.rotMat.m[ 7] = 0;
    
            mat4.rotMat.m[ 8] = (oneMinusCos * zx) - ys;
            mat4.rotMat.m[ 9] = (oneMinusCos * yz) + xs;
            mat4.rotMat.m[10] = (oneMinusCos * zz) + cosAngle;
            mat4.rotMat.m[11] = 0; 
    
            mat4.rotMat.m[12] = 0;
            mat4.rotMat.m[13] = 0;
            mat4.rotMat.m[14] = 0;
            mat4.rotMat.m[15] = 1;
    
            let temp = mat4.rotMat.multiplyByMatrix( this );
            this.set( temp );
        }
    }
    
    scale(scaleVector)
    {
        this.m[ 0] *= scaleVector.x; this.m[ 4] *= scaleVector.x; this.m[ 8] *= scaleVector.x; this.m[12] *= scaleVector.x;
        this.m[ 1] *= scaleVector.y; this.m[ 5] *= scaleVector.y; this.m[ 9] *= scaleVector.y; this.m[13] *= scaleVector.y;
        this.m[ 2] *= scaleVector.z; this.m[ 6] *= scaleVector.z; this.m[10] *= scaleVector.z; this.m[14] *= scaleVector.z;
    }

    scaleF32(x, y=x, z=x)
    {
        this.m[ 0] *= x; this.m[ 4] *= x; this.m[ 8] *= x; this.m[12] *= x;
        this.m[ 1] *= y; this.m[ 5] *= y; this.m[ 9] *= y; this.m[13] *= y;
        this.m[ 2] *= z; this.m[ 6] *= z; this.m[10] *= z; this.m[14] *= z;
    }

    timesScalar(o)
    {
        this.m[ 0] *= o; this.m[ 4] *= o; this.m[ 8] *= o; this.m[12] *= o;
        this.m[ 1] *= o; this.m[ 5] *= o; this.m[ 9] *= o; this.m[13] *= o;
        this.m[ 2] *= o; this.m[ 6] *= o; this.m[10] *= o; this.m[14] *= o;
        this.m[ 3] *= o; this.m[ 7] *= o; this.m[11] *= o; this.m[15] *= o;
    }

    multiplyByScalar(o)
    {
        let newmat = mat4.tempMat4;

        newmat.m[ 0] = this.m[ 0] * o; newmat.m[ 4] = this.m[ 4] * o; newmat.m[ 8] = this.m[ 8] * o; newmat.m[12] = this.m[12] * o;
        newmat.m[ 1] = this.m[ 1] * o; newmat.m[ 5] = this.m[ 5] * o; newmat.m[ 9] = this.m[ 9] * o; newmat.m[13] = this.m[13] * o;
        newmat.m[ 2] = this.m[ 2] * o; newmat.m[ 6] = this.m[ 6] * o; newmat.m[10] = this.m[10] * o; newmat.m[14] = this.m[14] * o;
        newmat.m[ 3] = this.m[ 3] * o; newmat.m[ 7] = this.m[ 7] * o; newmat.m[11] = this.m[11] * o; newmat.m[15] = this.m[15] * o;

        return newmat;
    }

    multiplyByMatrix(o)
    {
        let newmat = mat4.tempMat4;

        newmat.m[ 0] = this.m[ 0] * o.m[ 0] + this.m[ 4] * o.m[ 1] + this.m[ 8] * o.m[ 2] + this.m[12] * o.m[ 3];
        newmat.m[ 1] = this.m[ 1] * o.m[ 0] + this.m[ 5] * o.m[ 1] + this.m[ 9] * o.m[ 2] + this.m[13] * o.m[ 3];
        newmat.m[ 2] = this.m[ 2] * o.m[ 0] + this.m[ 6] * o.m[ 1] + this.m[10] * o.m[ 2] + this.m[14] * o.m[ 3];
        newmat.m[ 3] = this.m[ 3] * o.m[ 0] + this.m[ 7] * o.m[ 1] + this.m[11] * o.m[ 2] + this.m[15] * o.m[ 3];
        newmat.m[ 4] = this.m[ 0] * o.m[ 4] + this.m[ 4] * o.m[ 5] + this.m[ 8] * o.m[ 6] + this.m[12] * o.m[ 7];
        newmat.m[ 5] = this.m[ 1] * o.m[ 4] + this.m[ 5] * o.m[ 5] + this.m[ 9] * o.m[ 6] + this.m[13] * o.m[ 7];
        newmat.m[ 6] = this.m[ 2] * o.m[ 4] + this.m[ 6] * o.m[ 5] + this.m[10] * o.m[ 6] + this.m[14] * o.m[ 7];
        newmat.m[ 7] = this.m[ 3] * o.m[ 4] + this.m[ 7] * o.m[ 5] + this.m[11] * o.m[ 6] + this.m[15] * o.m[ 7];
        newmat.m[ 8] = this.m[ 0] * o.m[ 8] + this.m[ 4] * o.m[ 9] + this.m[ 8] * o.m[10] + this.m[12] * o.m[11];
        newmat.m[ 9] = this.m[ 1] * o.m[ 8] + this.m[ 5] * o.m[ 9] + this.m[ 9] * o.m[10] + this.m[13] * o.m[11];
        newmat.m[10] = this.m[ 2] * o.m[ 8] + this.m[ 6] * o.m[ 9] + this.m[10] * o.m[10] + this.m[14] * o.m[11];
        newmat.m[11] = this.m[ 3] * o.m[ 8] + this.m[ 7] * o.m[ 9] + this.m[11] * o.m[10] + this.m[15] * o.m[11];
        newmat.m[12] = this.m[ 0] * o.m[12] + this.m[ 4] * o.m[13] + this.m[ 8] * o.m[14] + this.m[12] * o.m[15];
        newmat.m[13] = this.m[ 1] * o.m[12] + this.m[ 5] * o.m[13] + this.m[ 9] * o.m[14] + this.m[13] * o.m[15];
        newmat.m[14] = this.m[ 2] * o.m[12] + this.m[ 6] * o.m[13] + this.m[10] * o.m[14] + this.m[14] * o.m[15];
        newmat.m[15] = this.m[ 3] * o.m[12] + this.m[ 7] * o.m[13] + this.m[11] * o.m[14] + this.m[15] * o.m[15];

        return newmat;
    }

    transformVec4(o)
    {
        mat4.tempVec4.setF32( this.m[ 0] * o.x + this.m[ 4] * o.y + this.m[ 8] * o.z + this.m[12] * o.w,
                              this.m[ 1] * o.x + this.m[ 5] * o.y + this.m[ 9] * o.z + this.m[13] * o.w,
                              this.m[ 2] * o.x + this.m[ 6] * o.y + this.m[10] * o.z + this.m[14] * o.w,
                              this.m[ 3] * o.x + this.m[ 7] * o.y + this.m[11] * o.z + this.m[15] * o.w );

        return mat4.tempVec4;
    }

    createScale(scale)
    {
        this.m[ 0] = scale.x; this.m[ 4] = 0;       this.m[ 8] = 0;       this.m[12] = 0;
        this.m[ 1] = 0;       this.m[ 5] = scale.y; this.m[ 9] = 0;       this.m[13] = 0;
        this.m[ 2] = 0;       this.m[ 6] = 0;       this.m[10] = scale.z; this.m[14] = 0;
        this.m[ 3] = 0;       this.m[ 7] = 0;       this.m[11] = 0;       this.m[15] = 1;
    }

    createScaleF32(x, y, z)
    {
        this.m[ 0] = x; this.m[ 4] = 0; this.m[ 8] = 0; this.m[12] = 0;
        this.m[ 1] = 0; this.m[ 5] = y; this.m[ 9] = 0; this.m[13] = 0;
        this.m[ 2] = 0; this.m[ 6] = 0; this.m[10] = z; this.m[14] = 0;
        this.m[ 3] = 0; this.m[ 7] = 0; this.m[11] = 0; this.m[15] = 1;
    }

    createSRT(scale, rotation, translation)
    {
        this.createScale( scale );
        this.rotate( rotation.z, 0, 0, 1 ); // roll
        this.rotate( rotation.x, 1, 0, 0 ); // pitch
        this.rotate( rotation.y, 0, 1, 0 ); // yaw
        this.translate( translation );
    }

    createView2D(cameraPosition)
    {
        this.setIdentity();

        this.m[12] = -cameraPosition.x;
        this.m[13] = -cameraPosition.y;
        this.m[14] = -cameraPosition.z;
    }

    createViewSRT(scale, rotation, translation)
    {
        this.setIdentity();
        this.translate( translation.times( -1 ) );
        this.rotate( -rotation.y, 0, 1, 0 ); // yaw
        this.rotate( -rotation.x, 1, 0, 0 ); // pitch
        this.rotate( -rotation.z, 0, 0, 1 ); // roll
        this.scaleF32( 1.0/scale.x, 1.0/scale.y, 1.0/scale.z );
    }

    createOrthoInfiniteZ(left, right, bottom, top)
    {
        this.m[ 0] = 2 / (right-left);
                        this.m[ 4] = 0; this.m[ 8] = 0; this.m[12] = -((right+left)/(right-left));
        this.m[ 1] = 0; this.m[ 5] = 2 / (top-bottom);
                                        this.m[ 9] = 0; this.m[13] = -((top+bottom)/(top-bottom));
        this.m[ 2] = 0; this.m[ 6] = 0; this.m[10] = 0; this.m[14] = 0;
        this.m[ 3] = 0; this.m[ 7] = 0; this.m[11] = 0; this.m[15] = 1;
    }

    createOrtho(left, right, bottom, top, near, far)
    {
        this.m[ 0] = 2 / (right-left);
                        this.m[ 4] = 0; this.m[ 8] = 0; this.m[12] = -((right+left)/(right-left));
        this.m[ 1] = 0; this.m[ 5] = 2 / (top-bottom);
                                        this.m[ 9] = 0; this.m[13] = -((top+bottom)/(top-bottom));
        this.m[ 2] = 0; this.m[ 6] = 0; this.m[10] = 2 / (far-near); this.m[14] = -((far+near)/(far-near));
        this.m[ 3] = 0; this.m[ 7] = 0; this.m[11] = 0; this.m[15] = 1;
    }

    createPerspectiveVFoV(fovDegrees, aspect, near, far)
    {
        let fov = 1.0 / Math.tan( fovDegrees/2.0 * Math.PI/180.0 );
        let inverseRange = 1.0 / (near - far);

        this.m[ 0] = fov / aspect;
        this.m[ 1] = this.m[ 2] = this.m[ 3] = 0.0;
    
        this.m[ 5] = fov;
        this.m[ 4] = this.m[ 6] = this.m[ 7] = 0.0;
    
        this.m[ 8] = 0;
        this.m[ 9] = 0;
        this.m[10] = -(near + far) * inverseRange;
        this.m[11] = 1.0;
    
        this.m[14] = near * far * inverseRange * 2;
        this.m[12] = this.m[13] = this.m[15] = 0.0;
    }

    getUp()
    {
        mat4.tempVec3.setF32( this.m[ 4], this.m[ 5], this.m[ 6] );
        return mat4.tempVec3;
    }

    getRight()
    {
        mat4.tempVec3.setF32( this.m[ 0], this.m[ 1], this.m[ 2] );
        return mat4.tempVec3;
    }

    getAt()
    {
        mat4.tempVec3.setF32( this.m[ 8], this.m[ 9], this.m[10] );
        return mat4.tempVec3;
    }

    inverse(tolerance = 0.0001)
    {
        // Determinants of 2x2 submatrices.
        let S0 = this.m[ 0] * this.m[ 5] - this.m[ 1] * this.m[ 4];
        let S1 = this.m[ 0] * this.m[ 6] - this.m[ 2] * this.m[ 4];
        let S2 = this.m[ 0] * this.m[ 7] - this.m[ 3] * this.m[ 4];
        let S3 = this.m[ 1] * this.m[ 6] - this.m[ 2] * this.m[ 5];
        let S4 = this.m[ 1] * this.m[ 7] - this.m[ 3] * this.m[ 5];
        let S5 = this.m[ 2] * this.m[ 7] - this.m[ 3] * this.m[ 6];

        let C5 = this.m[10] * this.m[15] - this.m[11] * this.m[14];
        let C4 = this.m[ 9] * this.m[15] - this.m[11] * this.m[13];
        let C3 = this.m[ 9] * this.m[14] - this.m[10] * this.m[13];
        let C2 = this.m[ 8] * this.m[15] - this.m[11] * this.m[12];
        let C1 = this.m[ 8] * this.m[14] - this.m[10] * this.m[12];
        let C0 = this.m[ 8] * this.m[13] - this.m[ 9] * this.m[12];

        // If determinant equals 0, there is no inverse.
        let det = S0 * C5 - S1 * C4 + S2 * C3 + S3 * C2 - S4 * C1 + S5 * C0;
        if( Math.abs(det) <= tolerance )
            return false;

        // Compute adjugate matrix.
        let am = mat4.adjugateMatrix;
        am.m[ 0] =  this.m[ 5] * C5 - this.m[ 6] * C4 + this.m[ 7] * C3;
        am.m[ 1] = -this.m[ 1] * C5 + this.m[ 2] * C4 - this.m[ 3] * C3;
        am.m[ 2] =  this.m[13] * S5 - this.m[14] * S4 + this.m[15] * S3;
        am.m[ 3] = -this.m[ 9] * S5 + this.m[10] * S4 - this.m[11] * S3;

        am.m[ 4] = -this.m[ 4] * C5 + this.m[ 6] * C2 - this.m[ 7] * C1;
        am.m[ 5] =  this.m[ 0] * C5 - this.m[ 2] * C2 + this.m[ 3] * C1;
        am.m[ 6] = -this.m[12] * S5 + this.m[14] * S2 - this.m[15] * S1;
        am.m[ 7] =  this.m[ 8] * S5 - this.m[10] * S2 + this.m[11] * S1;

        am.m[ 8] =  this.m[ 4] * C4 - this.m[ 5] * C2 + this.m[ 7] * C0;
        am.m[ 9] = -this.m[ 0] * C4 + this.m[ 1] * C2 - this.m[ 3] * C0;
        am.m[10] =  this.m[12] * S4 - this.m[13] * S2 + this.m[15] * S0;
        am.m[11] = -this.m[ 8] * S4 + this.m[ 9] * S2 - this.m[11] * S0;

        am.m[12] = -this.m[ 4] * C3 + this.m[ 5] * C1 - this.m[ 6] * C0;
        am.m[13] =  this.m[ 0] * C3 - this.m[ 1] * C1 + this.m[ 2] * C0;
        am.m[14] = -this.m[12] * S3 + this.m[13] * S1 - this.m[14] * S0;
        am.m[15] =  this.m[ 8] * S3 - this.m[ 9] * S1 + this.m[10] * S0;
        am.timesScalar( 1 / det );

        this.set( am );

        return true;
    }

    getInverse(tolerance = 0.0001)
    {
        let invMat = mat4.tempMat4;
        invMat.set( this );
        invMat.inverse( tolerance );
        return invMat;
    }
}
