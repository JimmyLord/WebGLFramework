// Values are stored column major.
// m[ 0] m[ 4] m[ 8] m[12]       Sx  0  0 Tx
// m[ 1] m[ 5] m[ 9] m[13]  --\   0 Sy  0 Ty
// m[ 2] m[ 6] m[10] m[14]  --/   0  0 Sz Tz
// m[ 3] m[ 7] m[11] m[15]        0  0  0  1

class mat4
{
    m: Float32Array = new Float32Array(16);

    // Temp vars to avoid GC.
    // Warning: This will cause issues if operations are chained since new values will overwrite old ones.
    // Temp moved to bottom of file as globals until closure compiler supports static properties.
    //static rotMat = new mat4();
    //static adjugateMatrix = new mat4();
    //static tempMat4 = new mat4();

    constructor()
    {
    }

    free()
    {
    }

    set(o: mat4)
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

    translate(pos: vec3)
    {
        this.m[12] += pos.x;
        this.m[13] += pos.y;
        this.m[14] += pos.z;
    }

    translateF32(x: number, y: number, z: number)
    {
        this.m[12] += x;
        this.m[13] += y;
        this.m[14] += z;
    }

    rotate(angleDegrees: number, x: number, y: number, z: number)
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
    
            mat4_rotMat.m[ 0] = (oneMinusCos * xx) + cosAngle;
            mat4_rotMat.m[ 1] = (oneMinusCos * xy) - zs;
            mat4_rotMat.m[ 2] = (oneMinusCos * zx) + ys;
            mat4_rotMat.m[ 3] = 0; 
    
            mat4_rotMat.m[ 4] = (oneMinusCos * xy) + zs;
            mat4_rotMat.m[ 5] = (oneMinusCos * yy) + cosAngle;
            mat4_rotMat.m[ 6] = (oneMinusCos * yz) - xs;
            mat4_rotMat.m[ 7] = 0;
    
            mat4_rotMat.m[ 8] = (oneMinusCos * zx) - ys;
            mat4_rotMat.m[ 9] = (oneMinusCos * yz) + xs;
            mat4_rotMat.m[10] = (oneMinusCos * zz) + cosAngle;
            mat4_rotMat.m[11] = 0; 
    
            mat4_rotMat.m[12] = 0;
            mat4_rotMat.m[13] = 0;
            mat4_rotMat.m[14] = 0;
            mat4_rotMat.m[15] = 1;
    
            let temp = mat4_rotMat.multiplyByMatrix( this );
            this.set( temp );
        }
    }
    
    scale(scaleVector: vec3)
    {
        this.m[ 0] *= scaleVector.x; this.m[ 4] *= scaleVector.x; this.m[ 8] *= scaleVector.x; this.m[12] *= scaleVector.x;
        this.m[ 1] *= scaleVector.y; this.m[ 5] *= scaleVector.y; this.m[ 9] *= scaleVector.y; this.m[13] *= scaleVector.y;
        this.m[ 2] *= scaleVector.z; this.m[ 6] *= scaleVector.z; this.m[10] *= scaleVector.z; this.m[14] *= scaleVector.z;
    }

    scaleF32(x: number, y: number = x, z: number = x)
    {
        this.m[ 0] *= x; this.m[ 4] *= x; this.m[ 8] *= x; this.m[12] *= x;
        this.m[ 1] *= y; this.m[ 5] *= y; this.m[ 9] *= y; this.m[13] *= y;
        this.m[ 2] *= z; this.m[ 6] *= z; this.m[10] *= z; this.m[14] *= z;
    }

    timesScalar(o: number)
    {
        this.m[ 0] *= o; this.m[ 4] *= o; this.m[ 8] *= o; this.m[12] *= o;
        this.m[ 1] *= o; this.m[ 5] *= o; this.m[ 9] *= o; this.m[13] *= o;
        this.m[ 2] *= o; this.m[ 6] *= o; this.m[10] *= o; this.m[14] *= o;
        this.m[ 3] *= o; this.m[ 7] *= o; this.m[11] *= o; this.m[15] *= o;
    }

    multiplyByScalar(o: number)
    {
        let tempMat = mat4_tempMat4;

        tempMat.m[ 0] = this.m[ 0] * o; tempMat.m[ 4] = this.m[ 4] * o; tempMat.m[ 8] = this.m[ 8] * o; tempMat.m[12] = this.m[12] * o;
        tempMat.m[ 1] = this.m[ 1] * o; tempMat.m[ 5] = this.m[ 5] * o; tempMat.m[ 9] = this.m[ 9] * o; tempMat.m[13] = this.m[13] * o;
        tempMat.m[ 2] = this.m[ 2] * o; tempMat.m[ 6] = this.m[ 6] * o; tempMat.m[10] = this.m[10] * o; tempMat.m[14] = this.m[14] * o;
        tempMat.m[ 3] = this.m[ 3] * o; tempMat.m[ 7] = this.m[ 7] * o; tempMat.m[11] = this.m[11] * o; tempMat.m[15] = this.m[15] * o;

        return tempMat;
    }

    multiplyByMatrix(o: mat4)
    {
        let tempMat = mat4_tempMat4;

        tempMat.m[ 0] = this.m[ 0] * o.m[ 0] + this.m[ 4] * o.m[ 1] + this.m[ 8] * o.m[ 2] + this.m[12] * o.m[ 3];
        tempMat.m[ 1] = this.m[ 1] * o.m[ 0] + this.m[ 5] * o.m[ 1] + this.m[ 9] * o.m[ 2] + this.m[13] * o.m[ 3];
        tempMat.m[ 2] = this.m[ 2] * o.m[ 0] + this.m[ 6] * o.m[ 1] + this.m[10] * o.m[ 2] + this.m[14] * o.m[ 3];
        tempMat.m[ 3] = this.m[ 3] * o.m[ 0] + this.m[ 7] * o.m[ 1] + this.m[11] * o.m[ 2] + this.m[15] * o.m[ 3];
        tempMat.m[ 4] = this.m[ 0] * o.m[ 4] + this.m[ 4] * o.m[ 5] + this.m[ 8] * o.m[ 6] + this.m[12] * o.m[ 7];
        tempMat.m[ 5] = this.m[ 1] * o.m[ 4] + this.m[ 5] * o.m[ 5] + this.m[ 9] * o.m[ 6] + this.m[13] * o.m[ 7];
        tempMat.m[ 6] = this.m[ 2] * o.m[ 4] + this.m[ 6] * o.m[ 5] + this.m[10] * o.m[ 6] + this.m[14] * o.m[ 7];
        tempMat.m[ 7] = this.m[ 3] * o.m[ 4] + this.m[ 7] * o.m[ 5] + this.m[11] * o.m[ 6] + this.m[15] * o.m[ 7];
        tempMat.m[ 8] = this.m[ 0] * o.m[ 8] + this.m[ 4] * o.m[ 9] + this.m[ 8] * o.m[10] + this.m[12] * o.m[11];
        tempMat.m[ 9] = this.m[ 1] * o.m[ 8] + this.m[ 5] * o.m[ 9] + this.m[ 9] * o.m[10] + this.m[13] * o.m[11];
        tempMat.m[10] = this.m[ 2] * o.m[ 8] + this.m[ 6] * o.m[ 9] + this.m[10] * o.m[10] + this.m[14] * o.m[11];
        tempMat.m[11] = this.m[ 3] * o.m[ 8] + this.m[ 7] * o.m[ 9] + this.m[11] * o.m[10] + this.m[15] * o.m[11];
        tempMat.m[12] = this.m[ 0] * o.m[12] + this.m[ 4] * o.m[13] + this.m[ 8] * o.m[14] + this.m[12] * o.m[15];
        tempMat.m[13] = this.m[ 1] * o.m[12] + this.m[ 5] * o.m[13] + this.m[ 9] * o.m[14] + this.m[13] * o.m[15];
        tempMat.m[14] = this.m[ 2] * o.m[12] + this.m[ 6] * o.m[13] + this.m[10] * o.m[14] + this.m[14] * o.m[15];
        tempMat.m[15] = this.m[ 3] * o.m[12] + this.m[ 7] * o.m[13] + this.m[11] * o.m[14] + this.m[15] * o.m[15];

        return tempMat;
    }

    transformVec4(o: vec4)
    {
        return vec4.getTemp( this.m[ 0] * o.x + this.m[ 4] * o.y + this.m[ 8] * o.z + this.m[12] * o.w,
                             this.m[ 1] * o.x + this.m[ 5] * o.y + this.m[ 9] * o.z + this.m[13] * o.w,
                             this.m[ 2] * o.x + this.m[ 6] * o.y + this.m[10] * o.z + this.m[14] * o.w,
                             this.m[ 3] * o.x + this.m[ 7] * o.y + this.m[11] * o.z + this.m[15] * o.w );
    }

    createScale(scale: vec3)
    {
        this.m[ 0] = scale.x; this.m[ 4] = 0;       this.m[ 8] = 0;       this.m[12] = 0;
        this.m[ 1] = 0;       this.m[ 5] = scale.y; this.m[ 9] = 0;       this.m[13] = 0;
        this.m[ 2] = 0;       this.m[ 6] = 0;       this.m[10] = scale.z; this.m[14] = 0;
        this.m[ 3] = 0;       this.m[ 7] = 0;       this.m[11] = 0;       this.m[15] = 1;
    }

    createScaleF32(x: number, y: number, z: number)
    {
        this.m[ 0] = x; this.m[ 4] = 0; this.m[ 8] = 0; this.m[12] = 0;
        this.m[ 1] = 0; this.m[ 5] = y; this.m[ 9] = 0; this.m[13] = 0;
        this.m[ 2] = 0; this.m[ 6] = 0; this.m[10] = z; this.m[14] = 0;
        this.m[ 3] = 0; this.m[ 7] = 0; this.m[11] = 0; this.m[15] = 1;
    }

    createSRT(scale: vec3, rotation: vec3, translation: vec3)
    {
        this.createScale( scale );
        this.rotate( rotation.z, 0, 0, 1 ); // roll
        this.rotate( rotation.x, 1, 0, 0 ); // pitch
        this.rotate( rotation.y, 0, 1, 0 ); // yaw
        this.translate( translation );
    }

    createView2D(cameraPosition: vec3)
    {
        this.setIdentity();

        this.m[12] = -cameraPosition.x;
        this.m[13] = -cameraPosition.y;
        this.m[14] = -cameraPosition.z;
    }

    createViewSRT(scale: vec3, rotation: vec3, translation: vec3)
    {
        this.setIdentity();
        this.translate( translation.times( -1 ) );
        this.rotate( -rotation.y, 0, 1, 0 ); // yaw
        this.rotate( -rotation.x, 1, 0, 0 ); // pitch
        this.rotate( -rotation.z, 0, 0, 1 ); // roll
        this.scaleF32( 1.0/scale.x, 1.0/scale.y, 1.0/scale.z );
    }

    createOrthoInfiniteZ(left: number, right: number, bottom: number, top: number)
    {
        this.m[ 0] = 2 / (right-left);
                        this.m[ 4] = 0; this.m[ 8] = 0; this.m[12] = -((right+left)/(right-left));
        this.m[ 1] = 0; this.m[ 5] = 2 / (top-bottom);
                                        this.m[ 9] = 0; this.m[13] = -((top+bottom)/(top-bottom));
        this.m[ 2] = 0; this.m[ 6] = 0; this.m[10] = 0; this.m[14] = 0;
        this.m[ 3] = 0; this.m[ 7] = 0; this.m[11] = 0; this.m[15] = 1;
    }

    createOrtho(left: number, right: number, bottom: number, top: number, near: number, far: number)
    {
        this.m[ 0] = 2 / (right-left);
                        this.m[ 4] = 0; this.m[ 8] = 0; this.m[12] = -((right+left)/(right-left));
        this.m[ 1] = 0; this.m[ 5] = 2 / (top-bottom);
                                        this.m[ 9] = 0; this.m[13] = -((top+bottom)/(top-bottom));
        this.m[ 2] = 0; this.m[ 6] = 0; this.m[10] = 2 / (far-near); this.m[14] = -((far+near)/(far-near));
        this.m[ 3] = 0; this.m[ 7] = 0; this.m[11] = 0; this.m[15] = 1;
    }

    createPerspectiveVFoV(fovDegrees: number, aspect: number, near: number, far: number)
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
        return vec3.getTemp( this.m[ 4], this.m[ 5], this.m[ 6] );
    }

    getRight()
    {
        return vec3.getTemp( this.m[ 0], this.m[ 1], this.m[ 2] );
    }

    getAt()
    {
        return vec3.getTemp( this.m[ 8], this.m[ 9], this.m[10] );
    }

    inverse(tolerance: number = 0.0001)
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
        let am = mat4_adjugateMatrix;
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

    getInverse(tolerance: number = 0.0001)
    {
        let invMat = mat4_tempMat4;
        invMat.set( this );
        invMat.inverse( tolerance );
        return invMat;
    }
}

let mat4_rotMat = new mat4();
let mat4_adjugateMatrix = new mat4();
let mat4_tempMat4 = new mat4();
