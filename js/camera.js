class Camera
{
    constructor(position, isOrtho, orthoWorldHeight, aspectRatio)
    {
        this.isOrtho = isOrtho;
        this.position = position;
        this.desiredHeight = orthoWorldHeight;
        this.aspectRatio = aspectRatio;

        this.matView = new mat4;
        this.matProj = new mat4;
    }

    free()
    {
        this.matView = null;
        this.matProj = null;
    }

    update()
    {
        this.matView.createView2D( this.position );

        if( this.isOrtho )
        {
            // If orthographic.
            var halfHeight = this.desiredHeight / 2;
            var halfWidth = halfHeight * this.aspectRatio;
            this.matProj.createOrthoInfiniteZ( -halfWidth, halfWidth, -halfHeight, halfHeight );
        }
        else
        {
            // If perspective.
            this.matProj.createPerspectiveVFoV( 45.0, this.aspectRatio, 0.01, 100.0 );
        }
    }
}
