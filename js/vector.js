class vec3
{
    constructor(x,y,z)
    {
        if( arguments.length == 1 )        { this.x = x; this.y = x; this.z = x; } // xxx
        else if( arguments.length == 2 )   { this.x = x; this.y = y; this.z = 0; } // xy0
        else                               { this.x = x; this.y = y; this.z = z; } // xyz
    }

    set(o)              { this.x = o.x; this.y = o.y; this.z = o.z; }
    setF32(x, y, z)     { this.x = x; this.y = y; this.z = z; }

    plus(o)             { return new vec3( this.x + o.x, this.y + o.y, this.z + o.z ); }
    plusF32(o)          { return new vec3( this.x + o, this.y + o, this.z + o ); }

    minus(o)            { return new vec3( this.x - o.x, this.y - o.y, this.z - o.z ); }
    minusF32(o)         { return new vec3( this.x - o, this.y - o, this.z - o ); }

    dividedByVec3(o)    { return new vec3( this.x / o.x, this.y / o.y, this.z / o.z ); }
    dividedBy(o)        { return new vec3( this.x / o, this.y / o, this.z / o ); }

    add(o)              { this.x += o.x; this.y += o.y; this.z += o.z; }
    addF32(o)           { this.x += o; this.y += o; this.z += o; }

    subtract(o)         { this.x -= o.x; this.y -= o.y; this.z -= o.z; }
    subtractF32(o)      { this.x -= o; this.y -= o; this.z -= o; }

    divideByVec3(o)     { this.x /= o.x; this.y /= o.y; this.z /= o.z; }
    divideBy(o)         { this.x /= o; this.y /= o; this.z /= o; }

    distanceFrom(o)
    {
        let d = this.minus( o );
        return Math.sqrt( d.x*d.x + d.y*d.y + d.z*d.z );
    }

    distanceFromSquared(o)
    {
        let d = this.minus( o );
        return d.x*d.x + d.y*d.y + d.z*d.z;
    }
}
