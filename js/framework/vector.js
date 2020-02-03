class vec3
{
    constructor(x,y,z)
    {
        if( arguments.length == 1 )        { this.x = x; this.y = x; this.z = x; } // xxx
        else if( arguments.length == 2 )   { this.x = x; this.y = y; this.z = 0; } // xy0
        else                               { this.x = x; this.y = y; this.z = z; } // xyz
    }
}
