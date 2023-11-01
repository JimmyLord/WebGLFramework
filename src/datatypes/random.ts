//namespace fw
//{
    export function randomFloat(min: number, max: number)
    {
        return Math.random() * (max - min) + min;
    }

    export function randomInt(min: number, max: number)
    {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    export function randomBool()
    {
        return Math.random() < 0.5;
    }
//}
