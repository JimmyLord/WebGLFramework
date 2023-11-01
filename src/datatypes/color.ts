//namespace fw
//{
    export class color
    {
        r: number = 1;
        g: number = 1;
        b: number = 1;
        a: number = 1;

        // Temp vars to avoid GC.
        // Warning: This will cause issues if operations are chained since new values will overwrite old ones.
        // Bigger warning: This is a terrible idea and will lead to very hard to debug issues.
        //                 I'm keeping it for now since I'm trying to minimize garbage collection.
        //static tempColors = [ new color, new color, new color, new color, new color, new color, new color, new color, new color, new color ];
        //static currentTempIndex = 0;
        static getTemp(r: number = 255, g: number = r, b: number = r, a: number = 255)
        {
            let t = color_tempVecs[color_currentTempIndex];
            t.r = r;
            t.g = g;
            t.b = b;
            t.a = a;
            color_currentTempIndex++;
            if( color_currentTempIndex === color_tempVecs.length )
                color_currentTempIndex = 0;
            return t;
        }

        constructor(r: any, g: number = 0, b: number = 0, a: number = 0)
        {
            if( r instanceof color )
            {
                this.r = r.r; this.g = r.g; this.b = r.b; this.a = r.a;
            }
            else if( typeof r === "number" )
            {
                this.r = r; this.g = g; this.b = b; this.a = a;
            }
        }

        cloneTemp(): color { return color.getTemp( this.r, this.g, this.b, this.a ); }
        clone(): color { return new color( this.r, this.g, this.b, this.a ); }

        set(r: number, g: number, b: number, a: number)
        {
            this.r = r; this.g = g; this.b = b; this.a = a;
        }

        setFromColor(o: color)
        {
            this.r = o.r; this.g = o.g; this.b = o.b; this.a = o.a;
        }
    }

    let color_tempVecs = [ new color(255,255,255,255), new color(255,255,255,255), new color(255,255,255,255),
                        new color(255,255,255,255), new color(255,255,255,255), new color(255,255,255,255),
                        new color(255,255,255,255), new color(255,255,255,255), new color(255,255,255,255),
                        new color(255,255,255,255), ];
    let color_currentTempIndex = 0;
//}
