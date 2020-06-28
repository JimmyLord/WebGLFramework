class vec2
{
    constructor(x,y)
    {
        if( arguments.length == 1 )        { this.x = x; this.y = x; } // xx
        else                               { this.x = x; this.y = y; } // xy
    }

    set(o)              { this.x = o.x; this.y = o.y; }
    setF32(x, y)        { this.x = x; this.y = y; }

    plus(o)             { return new vec2( this.x + o.x, this.y + o.y ); }
    plusF32(o)          { return new vec2( this.x + o, this.y + o ); }

    minus(o)            { return new vec2( this.x - o.x, this.y - o.y ); }
    minusF32(o)         { return new vec2( this.x - o, this.y - o ); }

    timesVec2(o)        { return new vec2( this.x * o.x, this.y * o.y ); }
    times(o)            { return new vec2( this.x * o, this.y * o ); }

    dividedByVec2(o)    { return new vec2( this.x / o.x, this.y / o.y ); }
    dividedBy(o)        { return new vec2( this.x / o, this.y / o ); }

    add(o)              { this.x += o.x; this.y += o.y; }
    addF32(o)           { this.x += o; this.y += o; }

    subtract(o)         { this.x -= o.x; this.y -= o.y; }
    subtractF32(o)      { this.x -= o; this.y -= o; }

    multiplyByVec2(o)   { this.x *= o.x; this.y *= o.y; }
    multiplyBy(o)       { this.x *= o; this.y *= o; }

    divideByVec2(o)     { this.x /= o.x; this.y /= o.y; }
    divideBy(o)         { this.x /= o; this.y /= o; }

    length()            { return Math.sqrt( this.x*this.x + this.y*this.y ); }

    distanceFrom(o)
    {
        let d = this.minus( o );
        return Math.sqrt( d.x*d.x + d.y*d.y );
    }

    distanceFromSquared(o)
    {
        let d = this.minus( o );
        return d.x*d.x + d.y*d.y;
    }

    normalize()
    {
        let len = this.length();
        this.x = this.x / len;
        this.y = this.y / len;
        return this;
    }

    getNormalized()
    {
        let len = this.length();
        return new vec2( this.x / len, this.y / len );
    }

    dot(o)
    {
        return this.x*o.x + this.y*o.y;
    }
}

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

    timesVec3(o)        { return new vec3( this.x * o.x, this.y * o.y, this.z * o.z ); }
    times(o)            { return new vec3( this.x * o, this.y * o, this.z * o ); }

    dividedByVec3(o)    { return new vec3( this.x / o.x, this.y / o.y, this.z / o.z ); }
    dividedBy(o)        { return new vec3( this.x / o, this.y / o, this.z / o ); }

    add(o)              { this.x += o.x; this.y += o.y; this.z += o.z; }
    addF32(o)           { this.x += o; this.y += o; this.z += o; }

    subtract(o)         { this.x -= o.x; this.y -= o.y; this.z -= o.z; }
    subtractF32(o)      { this.x -= o; this.y -= o; this.z -= o; }

    multiplyByVec3(o)   { this.x *= o.x; this.y *= o.y; this.z *= o.z; }
    multiplyBy(o)       { this.x *= o; this.y *= o; this.z *= o; }

    divideByVec3(o)     { this.x /= o.x; this.y /= o.y; this.z /= o.z; }
    divideBy(o)         { this.x /= o; this.y /= o; this.z /= o; }

    length()            { return Math.sqrt( this.x*this.x + this.y*this.y + this.z*this.z ); }

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

    normalize()
    {
        let len = this.length();
        this.x = this.x / len;
        this.y = this.y / len;
        this.z = this.z / len;
        return this;
    }

    getNormalized()
    {
        let len = this.length();
        return new vec3( this.x / len, this.y / len, this.z / len );
    }

    dot(o)
    {
        return this.x*o.x + this.y*o.y + this.z*o.z;
    }
}
