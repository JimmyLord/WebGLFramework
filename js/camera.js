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

    convertMouseToOrtho( canvas, x, y )
    {
        var orthoScaleX = this.matProj.m[0];
        var orthoOffsetX = this.matProj.m[12];
        var orthoScaleY = this.matProj.m[5];
        var orthoOffsetY = this.matProj.m[13];

        var orthoX = ((x / canvas.width) / orthoScaleX) * 2 - ((1 + orthoOffsetX) / orthoScaleX);
        var orthoY = (((canvas.height - y) / canvas.height) / orthoScaleY) * 2 - ((1 + orthoOffsetY) / orthoScaleY);

        return [orthoX, orthoY];
    }
}
