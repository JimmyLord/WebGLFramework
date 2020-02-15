class vec3
{
    constructor(x,y,z)
    {
        if( arguments.length == 1 )        { this.x = x; this.y = x; this.z = x; } // xxx
        else if( arguments.length == 2 )   { this.x = x; this.y = y; this.z = 0; } // xy0
        else                               { this.x = x; this.y = y; this.z = z; } // xyz
    }

    plus(o)
    {
        if( o instanceof vec3 ) return new vec3( this.x + o.x, this.y + o.y, this.z + o.z );
        else                    return new vec3( this.x + o, this.y + o, this.z + o );
    }

    minus(o)
    {
        if( o instanceof vec3 ) return new vec3( this.x - o.x, this.y - o.y, this.z - o.z );
        else                    return new vec3( this.x - o, this.y - o, this.z - o );
    }

    dividedBy(o)
    {
        if( o instanceof vec3 ) return new vec3( this.x / o.x, this.y / o.y, this.z / o.z );
        else                    return new vec3( this.x / o, this.y / o, this.z / o );
    }

    add(o)
    {
        if( o instanceof vec3 ) { this.x += o.x; this.y += o.y; this.z += o.z; }
        else                    { this.x += o; this.y += o; this.z += o; }
    }

    subtract(o)
    {
        if( o instanceof vec3 ) { this.x -= o.x; this.y -= o.y; this.z -= o.z; }
        else                    { this.x -= o; this.y -= o; this.z -= o; }
    }

    divideBy(o)
    {
        if( o instanceof vec3 ) { this.x /= o.x; this.y /= o.y; this.z /= o.z; }
        else                    { this.x /= o; this.y /= o; this.z /= o; }
    }

    distanceFrom(o)
    {
        let d = this.minus( o );
        return Math.sqrt( d.x*d.x + d.y*d.y + d.z*d.z );
    }
}
