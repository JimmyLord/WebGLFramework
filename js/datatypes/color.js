class color
{
    // Temp vars to avoid GC.
    // Warning: This will cause issues if operations are chained since new values will overwrite old ones.
    // Bigger warning: This is a terrible idea and will lead to very hard to debug issues.
    //                 I'm keeping it for now since I'm trying to minimize garbage collection.
    //static tempColors = [ new color, new color, new color, new color, new color, new color, new color, new color, new color, new color ];
    //static currentTempIndex = 0;
    static getTemp(r = 255, g = r, b = r, a = 255)
    {
        let t = color_tempVecs[color_currentTempIndex];
        t.r = r;
        t.g = g;
        t.b = b;
        t.a = a;
        color_currentTempIndex++;
        if( color_currentTempIndex === 10 )
            color_currentTempIndex = 0;
        return t;
    }

    constructor(r,g=undefined,b=undefined,a=undefined)
    {
        if( g === undefined ) // r is a color class.
        {
            this.r = r.r; this.g = r.g; this.b = r.b; this.a = r.a;
        }
        else // rgba separate.
        {
            this.r = r; this.g = g; this.b = b; this.a = a;
        }
    }

    set(r,g,b,a)
    {
        this.r = r; this.g = g; this.b = b; this.a = a;
    }

    setFromColor(color)
    {
        this.r = color.r; this.g = color.g; this.b = color.b; this.a = color.a;
    }
}

let color_tempVecs = [ new color(255,255,255,255), new color(255,255,255,255), new color(255,255,255,255),
                       new color(255,255,255,255), new color(255,255,255,255), new color(255,255,255,255),
                       new color(255,255,255,255), new color(255,255,255,255), new color(255,255,255,255),
                       new color(255,255,255,255), ];
let color_currentTempIndex = 0;
