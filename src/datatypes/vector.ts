class vec2
{
    x: number = 0;
    y: number = 0;

    // Temp pool, will reset at the start of every frame.
    // Will grow if more are needed during a single frame.
    static resetTemps()
    {
        for( let i=0; i<vec2_currentTempIndex; i++ )
        {
            vec2_tempPool.returnToPool( vec2_tempsOutsideOfPool[i] );
        }
        vec2_currentTempIndex = 0;
    }
    static getTemp(x = 0, y = x)
    {
        let t = vec2_tempPool.getFromPool();
        if( vec2_currentTempIndex < vec2_tempsOutsideOfPool.length )
            vec2_tempsOutsideOfPool[vec2_currentTempIndex] = t;
        else
            vec2_tempsOutsideOfPool.push( t );
        vec2_currentTempIndex++;
        t.x = x;
        t.y = y;
        return t;
    }

    constructor(x=0, y=x)
    {
        this.x = x;
        this.y = y;
    }

    cloneTemp(): vec2 { return vec2.getTemp( this.x, this.y ); }
    clone(): vec2 { return new vec2( this.x, this.y ); }
    asVec3Temp(): vec3 { return vec3.getTemp( this.x, this.y, 0 ); }
    asVec3(): vec3 { return new vec3( this.x, this.y, 0 ); }
    
    set(o: vec2) { this.x = o.x; this.y = o.y; }
    setF32(x: number, y: number) { this.x = x; this.y = y; }

    plus(o: vec2)           { return vec2.getTemp( this.x + o.x, this.y + o.y ); }
    plusF32(o: number)      { return vec2.getTemp( this.x + o, this.y + o ); }

    minus(o: vec2)          { return vec2.getTemp( this.x - o.x, this.y - o.y ); }
    minusF32(o: number)     { return vec2.getTemp( this.x - o, this.y - o ); }

    timesVec2(o: vec2)      { return vec2.getTemp( this.x * o.x, this.y * o.y ); }
    times(o: number)        { return vec2.getTemp( this.x * o, this.y * o ); }

    dividedByVec2(o: vec2)  { return vec2.getTemp( this.x / o.x, this.y / o.y ); }
    dividedBy(o: number)    { return vec2.getTemp( this.x / o, this.y / o ); }

    add(o: vec2)            { this.x += o.x; this.y += o.y; }
    addF32(o: number)       { this.x += o; this.y += o; }

    subtract(o: vec2)       { this.x -= o.x; this.y -= o.y; }
    subtractF32(o: number)  { this.x -= o; this.y -= o; }

    multiplyByVec2(o: vec2) { this.x *= o.x; this.y *= o.y; }
    multiplyBy(o: number)   { this.x *= o; this.y *= o; }

    divideByVec2(o: vec2)   { this.x /= o.x; this.y /= o.y; }
    divideBy(o: number)     { this.x /= o; this.y /= o; }

    length() { return Math.sqrt( this.x*this.x + this.y*this.y ); }

    distanceFrom(o: vec2)
    {
        let d = this.minus( o );
        return Math.sqrt( d.x*d.x + d.y*d.y );
    }

    distanceFromSquared(o: vec2)
    {
        let d = this.minus( o );
        return d.x*d.x + d.y*d.y;
    }

    normalize()
    {
        let len = this.length();

        if( len > 0 )
        {
            this.x = this.x / len;
            this.y = this.y / len;
        }

        return this;
    }

    getNormalized()
    {
        let len = this.length();
        if( len === 0 )
            return vec2.getTemp( 0, 0 );

        return vec2.getTemp( this.x / len, this.y / len );
    }

    dot(o: vec2)
    {
        return this.x*o.x + this.y*o.y;
    }

    cross(o: vec2)
    {
        return this.x*o.y - this.y*o.x;
    }
}

class vec3
{
    x: number = 0;
    y: number = 0;
    z: number = 0;

    static resetTemps()
    {
        for( let i=0; i<vec3_currentTempIndex; i++ )
        {
            vec3_tempPool.returnToPool( vec3_tempsOutsideOfPool[i] );
        }
        vec3_currentTempIndex = 0;
    }
    static getTemp(x = 0, y = x, z = x)
    {
        let t = vec3_tempPool.getFromPool();
        if( vec3_currentTempIndex < vec3_tempsOutsideOfPool.length )
            vec3_tempsOutsideOfPool[vec3_currentTempIndex] = t;
        else
            vec3_tempsOutsideOfPool.push( t );
        vec3_currentTempIndex++;
        t.x = x;
        t.y = y;
        t.z = z;
        return t;
    }

    constructor(x?:number, y?:number, z?:number)
    {
        if( x != null && y != null && z != null ) { this.x = x; this.y = y; this.z = z; }
        else if( x != null && y != null )         { this.x = x; this.y = y; this.z = 0; }
        else if( x != null )                      { this.x = x; this.y = x; this.z = x; }
        else                                      { this.x = 0; this.y = 0; this.z = 0; }
    }

    cloneTemp(): vec3 { return vec3.getTemp( this.x, this.y, this.z ); }
    clone(): vec3 { return new vec3( this.x, this.y, this.z ); }

    set(o: vec3) { this.x = o.x; this.y = o.y; this.z = o.z; }
    setF32(x: number, y: number, z: number) { this.x = x; this.y = y; this.z = z; }

    plus(o: vec3)           { return vec3.getTemp( this.x + o.x, this.y + o.y, this.z + o.z ); }
    plusF32(o: number)      { return vec3.getTemp( this.x + o, this.y + o, this.z + o ); }

    minus(o: vec3)          { return vec3.getTemp( this.x - o.x, this.y - o.y, this.z - o.z ); }
    minusF32(o: number)     { return vec3.getTemp( this.x - o, this.y - o, this.z - o ); }

    timesVec3(o: vec3)      { return vec3.getTemp( this.x * o.x, this.y * o.y, this.z * o.z ); }
    times(o: number)        { return vec3.getTemp( this.x * o, this.y * o, this.z * o ); }

    dividedByVec3(o: vec3)  { return vec3.getTemp( this.x / o.x, this.y / o.y, this.z / o.z ); }
    dividedBy(o: number)    { return vec3.getTemp( this.x / o, this.y / o, this.z / o ); }

    add(o: vec3)            { this.x += o.x; this.y += o.y; this.z += o.z; }
    addF32(o: number)       { this.x += o; this.y += o; this.z += o; }

    subtract(o: vec3)       { this.x -= o.x; this.y -= o.y; this.z -= o.z; }
    subtractF32(o: number)  { this.x -= o; this.y -= o; this.z -= o; }

    multiplyByVec3(o: vec3) { this.x *= o.x; this.y *= o.y; this.z *= o.z; }
    multiplyBy(o: number)   { this.x *= o; this.y *= o; this.z *= o; }

    divideByVec3(o: vec3)   { this.x /= o.x; this.y /= o.y; this.z /= o.z; }
    divideBy(o: number)     { this.x /= o; this.y /= o; this.z /= o; }

    length() { return Math.sqrt( this.x*this.x + this.y*this.y + this.z*this.z ); }

    distanceFrom(o: vec3)
    {
        let d = this.minus( o );
        return Math.sqrt( d.x*d.x + d.y*d.y + d.z*d.z );
    }

    distanceFromSquared(o: vec3)
    {
        let d = this.minus( o );
        return d.x*d.x + d.y*d.y + d.z*d.z;
    }

    normalize()
    {
        let len = this.length();
        
        if( len > 0 )
        {
            this.x = this.x / len;
            this.y = this.y / len;
            this.z = this.z / len;
        }
        return this;
    }

    getNormalized()
    {
        let len = this.length();
        if( len === 0 )
            return vec3.getTemp( 0, 0, 0 );

        return vec3.getTemp( this.x / len, this.y / len, this.z / len );
    }

    dot(o: vec3)
    {
        return this.x*o.x + this.y*o.y + this.z*o.z;
    }
}

class vec4
{
    x: number = 0;
    y: number = 0;
    z: number = 0;
    w: number = 0;

    static resetTemps()
    {
        for( let i=0; i<vec4_currentTempIndex; i++ )
        {
            vec4_tempPool.returnToPool( vec4_tempsOutsideOfPool[i] );
        }
        vec4_currentTempIndex = 0;
    }
    static getTemp(x = 0, y = x, z = x, w = x)
    {
        let t = vec4_tempPool.getFromPool();
        if( vec4_currentTempIndex < vec4_tempsOutsideOfPool.length )
            vec4_tempsOutsideOfPool[vec4_currentTempIndex] = t;
        else
            vec4_tempsOutsideOfPool.push( t );
        vec4_currentTempIndex++;
        t.x = x;
        t.y = y;
        t.z = z;
        t.w = w;
        return t;
    }

    constructor(x?:number, y?:number, z?:number, w?: number)
    {
        if( x != null && y != null && z != null && w != null ) { this.x = x; this.y = y; this.z = z; this.w = w; } // xyzw
        else if( x != null && y != null && z != null )         { this.x = x; this.y = y; this.z = z; this.w = 1; } // xyz1
        else if( x != null && y != null )                      { this.x = x; this.y = y; this.z = 0; this.w = 1; } // xy01
        else if( x != null )                                   { this.x = x; this.y = x; this.z = x; this.w = 1; } // xxx1
        else                                                   { this.x = 0; this.y = 0; this.z = 0; this.w = 1; } // 0001
    }

    cloneTemp(): vec4 { return vec4.getTemp( this.x, this.y, this.z, this.w ); }
    clone(): vec4 { return new vec4( this.x, this.y, this.z, this.w ); }

    set(o: vec4) { this.x = o.x; this.y = o.y; this.z = o.z; this.w = o.w; }
    setF32(x: number, y: number, z: number, w: number) { this.x = x; this.y = y; this.z = z; this.w = w; }

    plus(o: vec4)           { return vec4.getTemp( this.x + o.x, this.y + o.y, this.z + o.z, this.w + o.w ); }
    plusF32(o: number)      { return vec4.getTemp( this.x + o, this.y + o, this.z + o, this.w + o ); }

    minus(o: vec4)          { return vec4.getTemp( this.x - o.x, this.y - o.y, this.z - o.z, this.w - o.w ); }
    minusF32(o: number)     { return vec4.getTemp( this.x - o, this.y - o, this.z - o, this.w - o ); }

    timesVec3(o: vec4)      { return vec4.getTemp( this.x * o.x, this.y * o.y, this.z * o.z, this.w * o.w ); }
    times(o: number)        { return vec4.getTemp( this.x * o, this.y * o, this.z * o, this.w * o ); }

    dividedByVec3(o: vec4)  { return vec4.getTemp( this.x / o.x, this.y / o.y, this.z / o.z, this.w / o.w ); }
    dividedBy(o: number)    { return vec4.getTemp( this.x / o, this.y / o, this.z / o, this.w / o ); }

    add(o: vec4)            { this.x += o.x; this.y += o.y; this.z += o.z; this.w += o.w; }
    addF32(o: number)       { this.x += o; this.y += o; this.z += o; this.w += o; }

    subtract(o: vec4)       { this.x -= o.x; this.y -= o.y; this.z -= o.z; this.w -= o.w; }
    subtractF32(o: number)  { this.x -= o; this.y -= o; this.z -= o; this.w -= o; }

    multiplyByVec3(o: vec4) { this.x *= o.x; this.y *= o.y; this.z *= o.z; this.w *= o.w; }
    multiplyBy(o: number)   { this.x *= o; this.y *= o; this.z *= o; this.w *= o; }

    divideByVec3(o: vec4)   { this.x /= o.x; this.y /= o.y; this.z /= o.z; this.w /= o.w; }
    divideBy(o: number)     { this.x /= o; this.y /= o; this.z /= o; this.w /= o; }

    length() { return Math.sqrt( this.x*this.x + this.y*this.y + this.z*this.z + this.w*this.w ); }

    distanceFrom(o: vec4)
    {
        let d = this.minus( o );
        return Math.sqrt( d.x*d.x + d.y*d.y + d.z*d.z + d.w*d.w );
    }

    distanceFromSquared(o: vec4)
    {
        let d = this.minus( o );
        return d.x*d.x + d.y*d.y + d.z*d.z + d.w*d.w;
    }

    normalize()
    {
        let len = this.length();
        
        if( len > 0 )
        {
            this.x = this.x / len;
            this.y = this.y / len;
            this.z = this.z / len;
            this.w = this.w / len;
        }
        return this;
    }

    getNormalized()
    {
        let len = this.length();
        if( len === 0 )
            return vec4.getTemp( 0, 0, 0, 0 );

        return vec4.getTemp( this.x / len, this.y / len, this.z / len, this.w / len );
    }

    dot(o: vec4)
    {
        return this.x*o.x + this.y*o.y + this.z*o.z + this.w*o.w;
    }

    xyz()
    {
        return vec3.getTemp( this.x, this.y, this.z );
    }
}

let vec2_tempPool = new Pool( vec2, 100, true );
let vec2_tempsOutsideOfPool = new Array( 100 );
let vec2_currentTempIndex = 0;

let vec3_tempPool = new Pool( vec3, 100, true );
let vec3_tempsOutsideOfPool = new Array( 100 );
let vec3_currentTempIndex = 0;

let vec4_tempPool = new Pool( vec4, 100, true );
let vec4_tempsOutsideOfPool = new Array( 100 );
let vec4_currentTempIndex = 0;
