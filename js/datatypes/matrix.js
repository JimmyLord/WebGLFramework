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

    free()
    {
        this.m = null;
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
    
            let rotMat = new mat4;
            rotMat.m[ 0] = (oneMinusCos * xx) + cosAngle;
            rotMat.m[ 1] = (oneMinusCos * xy) - zs;
            rotMat.m[ 2] = (oneMinusCos * zx) + ys;
            rotMat.m[ 3] = 0; 
    
            rotMat.m[ 4] = (oneMinusCos * xy) + zs;
            rotMat.m[ 5] = (oneMinusCos * yy) + cosAngle;
            rotMat.m[ 6] = (oneMinusCos * yz) - xs;
            rotMat.m[ 7] = 0;
    
            rotMat.m[ 8] = (oneMinusCos * zx) - ys;
            rotMat.m[ 9] = (oneMinusCos * yz) + xs;
            rotMat.m[10] = (oneMinusCos * zz) + cosAngle;
            rotMat.m[11] = 0; 
    
            rotMat.m[12] = 0;
            rotMat.m[13] = 0;
            rotMat.m[14] = 0;
            rotMat.m[15] = 1;
    
            let temp = rotMat.multiply( this );
            this.m = temp.m;
            temp.m = null;
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

    multiply(o)
    {
        let newmat = new mat4;

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
        return new vec3( this.m[ 4], this.m[ 5], this.m[ 6] );
    }

    getRight()
    {
        return new vec3( this.m[ 0], this.m[ 1], this.m[ 2] );
    }

    getAt()
    {
        return new vec3( this.m[ 8], this.m[ 9], this.m[10] );
    }
}
