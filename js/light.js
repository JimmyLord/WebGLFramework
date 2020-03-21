class Light
{
    constructor(position, color)
    {
        this.position = position;
        this.color = color;
    }

    free()
    {
        this.position = null;
        this.color = null;
    }
}
