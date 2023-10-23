class Pool
{
    type: any;
    numAllocated: number;
    allowGrowth: boolean;
    numInPool: number;
    objects: any[];

    constructor(type: any, numberToAllocate: number = 1, allowGrowth: boolean = true)
    {
        this.type = type;
        this.numAllocated = numberToAllocate;
        this.allowGrowth = allowGrowth;
        this.numInPool = numberToAllocate;
        this.objects = new Array( numberToAllocate );

        for( let i=0; i<numberToAllocate; i++ )
        {
            this.objects[i] = new type;
        }
    }

    getFromPool()
    {
        if( this.numInPool === 0 )
        {
            //console.log( "Pool empty!" );
            if( this.allowGrowth )
            {
                //console.log( "Allocating more!" );
                let obj = new this.type();
                return obj;
            }
            else
            {
                return null;
            }
        }

        this.numInPool--;
        return this.objects[this.numInPool];
    }

    returnToPool(obj: any)
    {
        this.objects[this.numInPool] = obj;
        this.numInPool++;
    }
}
