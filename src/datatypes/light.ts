namespace fw
{
    export class Light
    {
        position: vec3;
        color: color;
        radius: number;

        constructor(position: vec3, color: color, radius: number)
        {
            this.position = position;
            this.color = color;
            this.radius = radius;
        }

        free()
        {
        }
    }
}
