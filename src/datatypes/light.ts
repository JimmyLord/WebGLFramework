import { color } from "./color.js";
import { vec3 } from "./vector.js";

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
