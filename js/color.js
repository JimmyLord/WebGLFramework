class color
{
    constructor(r,g,b,a)
    {
        if( arguments.length == 1 ) // r is a color class.
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
