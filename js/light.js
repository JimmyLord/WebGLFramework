class Light
{
    constructor(position, color, radius)
    {
        this.position = position;
        this.color = color;
        this.radius = radius;
    }

    free()
    {
        this.position = null;
        this.color = null;
        this.radius = null;
    }
}
